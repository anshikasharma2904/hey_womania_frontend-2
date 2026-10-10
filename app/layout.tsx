import type { Metadata } from "next";
import { Libre_Caslon_Text, Manrope, Cedarville_Cursive } from "next/font/google";
import "./globals.css";
import { LatestOffersWidget } from "@/components/LatestOffersWidget";
import { MainNavbar } from "@/components/MainNavbar";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { ExtensionErrorFilter } from "@/components/ExtensionErrorFilter";
import { WishbagProvider } from "@/contexts/WishbagContext";
import { PromoPopup } from "@/components/PromoPopup";
import { ReferralTracker } from "@/components/ReferralTracker";
import { CustomAnalyticsTracker } from "@/components/CustomAnalyticsTracker";

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

const cedarville = Cedarville_Cursive({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: "400"
});

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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-D38817RM74"></script>
        <script
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1701617601397965');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1701617601397965&ev=PageView&noscript=1" />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="bg-canvas text-mocha antialiased overflow-x-hidden">
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
            <LatestOffersWidget />
            <PromoPopup />
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform">
              <span className="sr-only">Talk to stylist on WhatsApp</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                <path d="M12.031 0C5.385 0 .001 5.383.001 12.029c0 2.122.551 4.195 1.597 6.01L0 24l6.113-1.605c1.761.968 3.738 1.48 5.918 1.48h.005c6.645 0 12.03-5.385 12.03-12.03S18.678 0 12.031 0zm0 21.874h-.003c-1.802 0-3.568-.485-5.115-1.401l-.367-.218-3.805.998.998-3.708-.239-.38C2.518 15.534 1.956 13.808 1.956 12.03c0-5.568 4.53-10.098 10.1-10.098 2.699 0 5.234 1.05 7.142 2.96A10.05 10.05 0 0122.13 12.03c0 5.568-4.529 10.097-10.098 10.097v-.853zm5.539-7.564c-.304-.152-1.796-.887-2.074-.988-.278-.102-.482-.152-.686.152-.204.304-.785.988-.962 1.19-.178.204-.356.228-.66.077-.305-.152-1.284-.473-2.446-1.51-1.021-.91-1.71-2.034-1.914-2.338-.204-.304-.022-.469.13-.621.137-.137.304-.355.457-.533.153-.178.204-.304.305-.508.102-.203.051-.38-.025-.533-.076-.152-.686-1.65-.94-2.26-.247-.591-.497-.512-.686-.521-.178-.008-.382-.008-.586-.008-.204 0-.535.076-.814.38-.28.305-1.07 1.041-1.07 2.54s1.095 2.946 1.248 3.149c.152.203 2.144 3.275 5.195 4.593 2.052.887 2.766.736 3.275.686.586-.058 1.796-.734 2.05-1.442.254-.708.254-1.314.178-1.442-.077-.126-.281-.202-.586-.355z"/>
              </svg>
            </a>
          </SmoothScrollProvider>
        </WishbagProvider>
      </body>
    </html>
  );
}
