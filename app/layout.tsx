import type { Metadata } from "next";
import { Libre_Caslon_Text, Manrope, Cedarville_Cursive } from "next/font/google";
import "./globals.css";
import { GlobalStoreWidgets } from "@/components/GlobalStoreWidgets";
import { MainNavbar } from "@/components/MainNavbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ExtensionErrorFilter } from "@/components/ExtensionErrorFilter";
import { WishbagProvider } from "@/contexts/WishbagContext";
import { ReferralTracker } from "@/components/ReferralTracker";
import { CustomAnalyticsTracker } from "@/components/CustomAnalyticsTracker";
import { DiwaliPatakaPopup } from "@/components/DiwaliPatakaPopup";

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap"
});

const cedarville = Cedarville_Cursive({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: "400",
  display: "swap"
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Hey Womaniyaa",
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

import Script from "next/script";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${libreCaslon.variable} ${manrope.variable} ${cedarville.variable} overflow-x-hidden`}>
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-canvas text-mocha antialiased overflow-x-hidden">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D38817RM74"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D38817RM74');
            `,
          }}
        />

        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];}(window);
              fbq('init', '1701617601397965');
              fbq('track', 'PageView');
            `,
          }}
        />
        <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="lazyOnload" />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1701617601397965&ev=PageView&noscript=1" alt="" />
        </noscript>
        <CustomAnalyticsTracker />
        <ReferralTracker />
        <ExtensionErrorFilter />
        <WishbagProvider>
          <SmoothScrollProvider>
            <MainNavbar />
            {children}
            <footer className="w-full bg-[#fcf9f4] py-5 text-center text-[0.72rem] text-[#8b837b] mt-auto">
              <p>© 2026 Hey Womaniyaa. All Rights Reserved.</p>
            </footer>
            <GlobalStoreWidgets />
            <MobileBottomNav />
            <DiwaliPatakaPopup />
          </SmoothScrollProvider>
        </WishbagProvider>
      </body>
    </html>
  );
}
