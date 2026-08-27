import dotenv from "dotenv";

dotenv.config();

async function main() {
  const payload = {
    items: [
      {
        productId: "test-prod-1",
        sku: "HEYMBF-L",
        name: "Test Product",
        qty: 1,
        price: 1000
      }
    ],
    address: {
      name: "Test Customer",
      street: "Test Street 123",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122002",
      phone: "9876543210",
      email: "test@example.com"
    },
    paymentMethod: "cod",
    total: "₹1,000"
  };

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (error: any) {
    console.error("Fetch error:", error.message);
  }
}
main();
