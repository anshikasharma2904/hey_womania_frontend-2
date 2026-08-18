import { BestSellersCoverflow } from "@/components/BestSellersCoverflow";
import { StoreFooter } from "@/components/StoreFooter";

export default function BestSellersPage() {
  return (
    <main className="min-h-screen bg-[#fcf9f4] pb-16 pt-6 text-[#1c1c19] md:pb-0 md:pt-8 lg:pt-10">
      <BestSellersCoverflow title="Most loved" viewAllHref="/category/all" />
      <StoreFooter />
    </main>
  );
}
