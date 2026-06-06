import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "South Peninsula Marketplace | Join the Waitlist",
  description:
    "A safe, verified, local alternative to Facebook Marketplace. Muizenberg to Simon's Town & Noordhoek to Kommetjie. Cash on collection, no scammers.",
  keywords: [
    "South Peninsula",
    "Marketplace",
    "Cape Town",
    "Muizenberg",
    "Fish Hoek",
    "Noordhoek",
    "Kommetjie",
    "Simon's Town",
    "Verified Sellers",
    "Local buying",
    "Classifieds South Africa",
  ],
  authors: [{ name: "South Peninsula Marketplace" }],
  openGraph: {
    title: "South Peninsula Marketplace | Join the Waitlist",
    description:
      "A safe, verified, local alternative to Facebook Marketplace. Cash on collection, verified neighbours only.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={hanken.variable}>
      <body>{children}</body>
    </html>
  );
}
