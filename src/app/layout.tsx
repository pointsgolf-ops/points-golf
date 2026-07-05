import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Points Golf",
  manifest: "/manifest.json",
  description: "Golf scored differently.",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32" },
      { url: "/icons/favicon-16.png", sizes: "16x16" }
    ],
    apple: "/icons/icon-180.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: "var(--font-dm-sans)",
          letterSpacing: "-0.02em",
        }}
      >
        {children}
      </body>
    </html>
  );
}