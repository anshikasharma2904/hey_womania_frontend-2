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
    "Editorial women’s fashion landing page with cinematic runway styling."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreCaslon.variable} ${manrope.variable}`}>
      <head>
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
          <LatestOffersWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
