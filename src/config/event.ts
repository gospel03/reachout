/**
 * ✏️  EDIT THIS FILE to change event details & social media links.
 * Everything shown on the phone page and the big screen comes from here.
 */
export const EVENT = {
  name: "LEAD NEXT",
  kicker: "Youth Meet",
  tagline: "Same God · One Mission · Generations",
  verse: "…entrusting to reliable people… — 2 Timothy 2:2",
  headline: "Raising Up Young Leaders",
  date: "October 22nd, 2026 · 9:30 AM – 2:30 PM",
  venue: "Jeevarakshaka Prayer House, Byrathi, Bengaluru",
  ministry: "Reachout Ministries Intl.",

  // Put your logo file at  public/brand/logo.png  (white logo with transparent background)
  logoPath: "/brand/logo.png",

  // Max characters per question
  maxLength: 400,
};

export type SocialKind = "instagram" | "youtube" | "facebook" | "whatsapp" | "website" | "spotify" | "x";

export interface SocialLink {
  kind: SocialKind;
  label: string;
  handle: string;
  url: string;
}

// ✏️  Replace these with your real pages. Remove any you don't use.
export const SOCIALS: SocialLink[] = [
  { kind: "instagram", label: "Instagram", handle: "@reachoutministries", url: "https://instagram.com/reachoutministries" },
  { kind: "youtube", label: "YouTube", handle: "Reachout Ministries Intl.", url: "https://youtube.com/@reachoutministries" },
  { kind: "facebook", label: "Facebook", handle: "Reachout Ministries Intl.", url: "https://facebook.com/reachoutministries" },
  { kind: "website", label: "Website", handle: "reachoutministries.org", url: "https://reachoutministries.org" },
];
