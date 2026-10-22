"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LatestOffersWidget = dynamic(() => import("./LatestOffersWidget").then(module => module.LatestOffersWidget), { ssr: false });
const SurpriseGiftModal = dynamic(() => import("./SurpriseGiftModal").then(module => module.SurpriseGiftModal), { ssr: false });

export function GlobalStoreWidgets() {
  const [showOffers, setShowOffers] = useState(false);
  const [gift, setGift] = useState<{ productName: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowOffers(true), 2500);
    // Capture the event before downloading the modal, including its product name.
    const openGift = (event: Event) => {
      const detail = (event as CustomEvent<{ productName?: string }>).detail;
      setGift({ productName: detail?.productName || "" });
    };
    window.addEventListener("surprise_gift_modal_open", openGift);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("surprise_gift_modal_open", openGift);
    };
  }, []);

  return <>
    {showOffers && <LatestOffersWidget />}
    {gift && <SurpriseGiftModal isOpen addedProductName={gift.productName} onClose={() => setGift(null)} />}
  </>;
}
