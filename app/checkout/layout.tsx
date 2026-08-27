import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");

  if (!sessionToken) {
    redirect("/login?redirect=/checkout");
  }
  
  return <>{children}</>;
}
