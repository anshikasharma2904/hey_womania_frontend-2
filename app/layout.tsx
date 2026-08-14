import type { Metadata } from "next";
import { Libre_Caslon_Text, Manrope } from "next/font/google";
import "./globals.css";
import { LatestOffersWidget } from "@/components/LatestOffersWidget";
import { MainNavbar } from "@/components/MainNavbar";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ExtensionErrorFilter } from "@/components/ExtensionErrorFilter";

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "HeyWomaniyaa",
  description:
    "Editorial women’s fashion landing page with cinematic runway styling.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreCaslon.variable} ${manrope.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-canvas text-mocha antialiased">
        <ExtensionErrorFilter />
        <SmoothScrollProvider>
          <MainNavbar />
          {children}
          <footer className="w-full bg-[#fcf9f4] py-5 text-center text-[0.72rem] text-[#8b837b] mt-auto">
            <p>© 2026 HeyWomaniyaa. All Rights Reserved.</p>
          </footer>
          <LatestOffersWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
