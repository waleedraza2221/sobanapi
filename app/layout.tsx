import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadHunter - Find Your Next Customer",
  description: "Discover and connect with buyers in any niche and location using LinkedIn data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}