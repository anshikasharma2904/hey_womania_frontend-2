"use client";

import { useEffect, useMemo, useState } from "react";

type Variant = {
  sku: string;
  size: string;
  color: string;
  availableStock: number;
  reservedStock: number;
  zohoItemId?: string;
  zohoSyncStatus?: string;
  zohoSyncError?: string;
  zohoLastSyncedAt?: string;
};

type Product = {
  id: string;
  title: string;
  salePrice: number;
  variants: Variant[];
  zohoSyncStatus?: string;
  zohoLastSyncedAt?: string;
};

type ZohoStatus = {
  configured: boolean;
  organizationId: string;
  apiDomain: string;
  requiredEnv: string[];
};

export default function ZohoInventoryPage() {
  const [status, setStatus] = useState<ZohoStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  const totals = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        product.variants?.forEach((variant) => {
          acc.variants += 1;
          acc.available += Number(variant.availableStock || 0);
          acc.reserved += Number(variant.reservedStock || 0);
          if (variant.zohoItemId) acc.synced += 1;
        });
        return acc;
      },
      { variants: 0, available: 0, reserved: 0, synced: 0 }
    );
  }, [products]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, productsRes] = await Promise.all([
        fetch("/api/admin/zoho/status"),
        fetch("/api/admin/products")
      ]);
      const statusData = await statusRes.json();
      const productsData = await productsRes.json();
      setStatus(statusData);
      const items = productsData.data ? productsData.data : Array.isArray(productsData) ? productsData : [];
      setProducts(items);
    } catch {
      setMessage("Unable to load Zoho inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (action: string, url: string) => {
    setBusyAction(action);
    setMessage("");
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Zoho action failed.");
        return;
      }
      setMessage("Zoho action completed.");
      await loadData();
    } catch {
      setMessage("Zoho action failed.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 py-10 text-[#1c1c19] md:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9c4049]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
              Zoho Inventory
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runAction("sync-all", "/api/admin/zoho/products/sync-all")}
              disabled={Boolean(busyAction) || !status?.configured}
              className="rounded-xl bg-[#111111] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-45"
            >
              {busyAction === "sync-all" ? "Syncing..." : "Sync All"}
            </button>
            <button
              onClick={() => runAction("pull-all", "/api/admin/zoho/products/stock/pull-all")}
              disabled={Boolean(busyAction) || !status?.configured}
              className="rounded-xl border border-[#d8cec4] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#1c1c19] disabled:opacity-45"
            >
              {busyAction === "pull-all" ? "Pulling..." : "Pull Stock"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Zoho", status?.configured ? "Configured" : "Missing env"],
            ["Variants", totals.variants],
            ["Synced", totals.synced],
            ["Available", totals.available]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#ece6df] bg-white p-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8b837b]">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        {status && !status.configured && (
          <div className="mb-6 rounded-xl border border-[#f2d2d6] bg-[#fff0f1] p-4 text-sm text-[#9c4049]">
            Add Zoho env values in the backend before syncing: {status.requiredEnv.join(", ")}.
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-[#ece6df] bg-white p-4 text-sm text-[#5f5d3e]">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[#ece6df] bg-white">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-[#ece6df] bg-[#f7f2ec] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6d655d]">
            <span>Product</span>
            <span>Stock</span>
            <span>Zoho</span>
            <span>Action</span>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-[#6d655d]">Loading inventory...</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-sm text-[#6d655d]">No products found.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border-b border-[#f0ebe4] px-4 py-4 last:border-b-0">
                <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                  <div>
                    <p className="font-bold">{product.title}</p>
                    <p className="mt-1 text-xs text-[#8b837b]">{product.variants?.length || 0} variants</p>
                  </div>
                  <div className="text-sm text-[#6d655d]">
                    {product.variants?.map((variant) => (
                      <p key={variant.sku}>{variant.sku}: {variant.availableStock || 0} available</p>
                    ))}
                  </div>
                  <div className="text-sm text-[#6d655d]">
                    {product.variants?.map((variant) => (
                      <p key={variant.sku}>
                        {variant.zohoItemId ? "Linked" : "Not linked"}
                        {variant.zohoSyncError ? ` - ${variant.zohoSyncError}` : ""}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => runAction(`sync-${product.id}`, `/api/admin/zoho/products/${product.id}/sync`)}
                      disabled={Boolean(busyAction) || !status?.configured}
                      className="rounded-lg bg-[#5f5d3e] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:opacity-45"
                    >
                      Sync
                    </button>
                    <button
                      onClick={() => runAction(`pull-${product.id}`, `/api/admin/zoho/products/${product.id}/stock/pull`)}
                      disabled={Boolean(busyAction) || !status?.configured}
                      className="rounded-lg border border-[#d8cec4] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] disabled:opacity-45"
                    >
                      Pull
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
