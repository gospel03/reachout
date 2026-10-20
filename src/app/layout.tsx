import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEAD NEXT · Ask Your Question",
  description: "Anonymous Q&A for the LEAD NEXT Youth Meet — Reachout Ministries Intl.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06142b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800&family=Permanent+Marker&display=swap"
        />
      </head>
      <body className="bg-[#06142b] text-white antialiased">{children}</body>
    </html>
  );
}
