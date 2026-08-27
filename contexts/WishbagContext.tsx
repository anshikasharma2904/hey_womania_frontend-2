"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WishbagItem {
  slug: string;
  title: string;
  category: string;
  price: string;
  image: string;
  href: string;
}

interface WishbagContextType {
  items: WishbagItem[];
  addToWishbag: (item: WishbagItem) => void;
  removeFromWishbag: (slug: string) => void;
  isWishbagged: (slug: string) => boolean;
}

const WishbagContext = createContext<WishbagContextType | undefined>(undefined);

export function WishbagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishbagItem[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem("wishbagItems");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse wishbag from localStorage", error);
    }
  }, []);

  const saveItems = (newItems: WishbagItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem("wishbagItems", JSON.stringify(newItems));
    } catch (error) {
      console.error("Failed to save wishbag to localStorage", error);
    }
  };

  const addToWishbag = (item: WishbagItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      const newItems = [...prev, item];
      saveItems(newItems);
      return newItems;
    });
  };

  const removeFromWishbag = (slug: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.slug !== slug);
      saveItems(newItems);
      return newItems;
    });
  };

  const isWishbagged = (slug: string) => {
    return items.some((i) => i.slug === slug);
  };

  return (
    <WishbagContext.Provider
      value={{ items, addToWishbag, removeFromWishbag, isWishbagged }}
    >
      {children}
    </WishbagContext.Provider>
  );
}

export function useWishbag() {
  const context = useContext(WishbagContext);
  if (context === undefined) {
    throw new Error("useWishbag must be used within a WishbagProvider");
  }
  return context;
}
