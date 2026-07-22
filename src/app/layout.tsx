import type { Metadata } from "next";
import { Gabarito, Space_Grotesk } from "next/font/google";
import "./globals.css";

const gabarito = Gabarito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gabarito",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
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
    <html
  lang="en"
  className={`${gabarito.variable} ${spaceGrotesk.variable} h-full antialiased`}
  style={{ colorScheme: "only light" }}
>
<body
  className="min-h-full flex flex-col"
  style={{
    fontFamily: "var(--font-space-grotesk)",
    letterSpacing: "-0.01em",
    color: "#000000",
    background: "#FFF",
    colorScheme: "only light",
  }}
>
        {children}
      </body>
    </html>
  );
}