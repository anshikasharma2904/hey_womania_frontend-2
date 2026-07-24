import { BestSellersCoverflow } from "@/components/BestSellersCoverflow";
import { StoreFooter } from "@/components/StoreFooter";

export default function BestSellersPage() {
  return (
    <main className="min-h-screen bg-[#fcf9f4] pb-16 pt-44 text-[#1c1c19] md:pb-0 md:pt-40 lg:pt-44">
      <BestSellersCoverflow title="Best Sellers" viewAllHref="/category/all" />
      <StoreFooter />
    </main>
  );
}
