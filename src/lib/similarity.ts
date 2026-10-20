/**
 * Free, offline "same question, different words" detector.
 * Combines meaning-ish word overlap (with stemming + synonyms) and
 * character-trigram overlap (catches typos / spelling variants).
 */

const STOPWORDS = new Set(
  `a an the is are was were be been being am do does did doing have has had having i me my mine we our us you your
  yours he she it its they them their this that these those of to in on at by for with about as into from up down out
  over under again then once here there when where why how what which who whom can could should would will shall may
  might must and or but if so than too very just also any some such no nor not only own same s t don
  please pls plz kindly tell explain know want wanna question ask asking someone anyone pastor sir brother bro guys like really actually`
    .split(/\s+/)
    .filter(Boolean),
);

// Normalise slang/spelling + group near-synonyms onto one root.
const SYNONYMS: Record<string, string> = {
  u: "you", ur: "your", r: "are", y: "why", wat: "what", wht: "what", abt: "about", bcoz: "because", bcz: "because",
  cuz: "because", coz: "because", gonna: "going", gud: "good", thx: "thanks",
  lord: "god", almighty: "god", father: "god", jesus: "christ", christ: "christ",
  scripture: "bible", scriptures: "bible", word: "bible",
  pray: "prayer", praying: "prayer", prayers: "prayer", prayed: "prayer",
  sin: "sin", sins: "sin", sinning: "sin", sinful: "sin",
  boyfriend: "relationship", girlfriend: "relationship", dating: "relationship", date: "relationship",
  marriage: "relationship", marry: "relationship", relationships: "relationship", crush: "relationship",
  parent: "parents", mom: "parents", dad: "parents", mother: "parents", mum: "parents",
  job: "career", jobs: "career", work: "career", profession: "career", careers: "career",
  study: "studies", studying: "studies", exam: "studies", exams: "studies", college: "studies", school: "studies",
  phone: "phone", mobile: "phone", social: "media", instagram: "media", reels: "media",
  sad: "depression", depressed: "depression", lonely: "depression", anxiety: "depression", anxious: "depression",
  stress: "depression", stressed: "depression", fear: "depression", afraid: "depression", worried: "depression",
  lead: "leader", leading: "leader", leadership: "leader", leaders: "leader",
  serve: "ministry", serving: "ministry", service: "ministry", ministries: "ministry",
  calling: "purpose", called: "purpose", plan: "purpose",
  doubt: "doubt", doubts: "doubt", doubting: "doubt",
  forgive: "forgiveness", forgiven: "forgiveness", forgiving: "forgiveness",
  church: "church", churches: "church",
  friends: "friend", friendship: "friend",
};

const CONTRACTIONS: [RegExp, string][] = [
  [/\bwon't\b/g, "will not"], [/\bcan't\b/g, "can not"], [/n't\b/g, " not"], [/'re\b/g, " are"],
  [/'s\b/g, " is"], [/'d\b/g, " would"], [/'ll\b/g, " will"], [/'ve\b/g, " have"], [/'m\b/g, " am"],
];

function stem(w: string): string {
  if (w.length <= 3) return w;
  for (const suf of ["ingly", "edly", "ness", "ment", "ing", "ies", "ied", "ed", "ly", "es", "s"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      const base = w.slice(0, -suf.length);
      return suf === "ies" || suf === "ied" ? base + "y" : base;
    }
  }
  return w;
}

export function tokens(text: string): string[] {
  let t = text.toLowerCase().replace(/[’`]/g, "'");
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  t = t.replace(/[^a-z0-9\s]/g, " ");
  const out: string[] = [];
  for (const raw of t.split(/\s+/)) {
    if (!raw) continue;
    const syn = SYNONYMS[raw] ?? raw;
    if (STOPWORDS.has(syn)) continue;
    const s = SYNONYMS[stem(syn)] ?? stem(syn);
    if (s.length < 2 || STOPWORDS.has(s)) continue;
    out.push(s);
  }
  return out;
}

function trigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  const p = ` ${s} `;
  for (let i = 0; i < p.length - 2; i++) {
    const g = p.slice(i, i + 3);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  if (!a.size || !b.size) return 0;
  let dot = 0, na = 0, nb = 0;
  for (const [k, v] of a) { na += v * v; const w = b.get(k); if (w) dot += v * w; }
  for (const v of b.values()) nb += v * v;
  return dot / Math.sqrt(na * nb);
}

interface Prepared { words: Map<string, number>; grams: Map<string, number>; }

function prepare(text: string): Prepared {
  const toks = tokens(text);
  const words = new Map<string, number>();
  for (const w of toks) words.set(w, (words.get(w) ?? 0) + 1);
  return { words, grams: trigrams([...new Set(toks)].sort().join(" ")) };
}

export function similarity(a: Prepared, b: Prepared): number {
  return 0.6 * cosine(a.words, b.words) + 0.4 * cosine(a.grams, b.grams);
}

export interface Clusterable { id: number; text: string; }

/** Greedy clustering. Returns arrays of items that look like the same question. */
export function cluster<T extends Clusterable>(items: T[], threshold = 0.5): T[][] {
  const prepared = new Map<number, Prepared>(items.map((q) => [q.id, prepare(q.text)]));
  const groups: { members: T[] }[] = [];
  for (const item of items) {
    const p = prepared.get(item.id)!;
    let best = -1, bestScore = 0;
    groups.forEach((g, gi) => {
      let score = 0;
      for (const m of g.members) score = Math.max(score, similarity(p, prepared.get(m.id)!));
      if (score > bestScore) { bestScore = score; best = gi; }
    });
    if (best >= 0 && bestScore >= threshold) groups[best].members.push(item);
    else groups.push({ members: [item] });
  }
  return groups.map((g) => g.members);
}
