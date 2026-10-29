export interface CartItem {
  productId: string;
  title: string;
  image: string;
  images?: string[];
  sku: string;
  size: string;
  color: string;
  salePrice: number;
  originalPrice?: number;
  quantity: number;
  maxStock?: number;
  isFreeGift?: boolean;
}

export const SURPRISE_GIFT_SKU = "SURPRISE-GIFT";
export const SURPRISE_GIFT_PRODUCT_ID = "surprise-gift";

export const SURPRISE_GIFT_ITEM: CartItem = {
  productId: SURPRISE_GIFT_PRODUCT_ID,
  title: "Surprise Gift 🎁",
  image: "/surprise-gift-box.jpg",
  images: ["/surprise-gift-box.jpg"],
  sku: SURPRISE_GIFT_SKU,
  size: "Complimentary",
  color: "Luxury Gold",
  salePrice: 0,
  quantity: 1,
  maxStock: 1,
  isFreeGift: true,
};

/**
 * Ensures that if a user has any qualifying products in their cart,
 * a complimentary surprise gift is automatically added.
 * If all non-gift items are removed, the gift is removed.
 */
export function syncCartWithSurpriseGift(cart: any[]): {
  cart: any[];
  giftNewlyAdded: boolean;
} {
  if (!Array.isArray(cart)) {
    return { cart: [], giftNewlyAdded: false };
  }

  const qualifyingItems = cart.filter(
    (item) => item.sku !== SURPRISE_GIFT_SKU && !item.isFreeGift
  );

  // If no qualifying items remain, remove gift
  if (qualifyingItems.length === 0) {
    return { cart: [], giftNewlyAdded: false };
  }

  const existingGiftIndex = cart.findIndex(
    (item) => item.sku === SURPRISE_GIFT_SKU || item.isFreeGift
  );

  if (existingGiftIndex === -1) {
    // Add new surprise gift
    return {
      cart: [...cart, { ...SURPRISE_GIFT_ITEM }],
      giftNewlyAdded: true,
    };
  }

  // Already present - ensure price remains 0 and quantity is 1
  const updated = [...cart];
  updated[existingGiftIndex] = {
    ...updated[existingGiftIndex],
    ...SURPRISE_GIFT_ITEM,
    salePrice: 0,
    quantity: 1,
  };

  return {
    cart: updated,
    giftNewlyAdded: false,
  };
}
