import express from "express";
import { getDashboardStats } from "../controllers/adminController";
import { getSettings, updateSettings } from "../controllers/settingController";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { getCustomers, toggleCustomerBlock } from "../controllers/customerController";
import { getOrders, updateOrderStatus } from "../controllers/adminOrderController";
import { getShipments, createShipment, createShiprocketShipment, updateShipment } from "../controllers/shipmentController";
import { getRequests, updateRequestStatus } from "../controllers/requestController";
import { getPartners, getSellPointLedgers } from "../controllers/adminPartnerController";
import { getIncomeLedgers } from "../controllers/adminIncomeController";
import { getKycs, updateKycStatus, getPayouts, updatePayoutStatus } from "../controllers/kycPayoutController";
import { getClosingPreview, executeClosing } from "../controllers/closingController";
import { getBonanzas, createBonanza, getAuditLogs } from "../controllers/adminFinalController";
import { getZohoStatus, pullAllStock, pullProductStock, syncAllProducts, syncProduct } from "../controllers/zohoInventoryController";

const router = express.Router();

router.get("/dashboard/stats", getDashboardStats);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Categories
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Products
router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Zoho Inventory
router.get("/zoho/status", getZohoStatus);
router.post("/zoho/products/sync-all", syncAllProducts);
router.post("/zoho/products/:id/sync", syncProduct);
router.post("/zoho/products/stock/pull-all", pullAllStock);
router.post("/zoho/products/:id/stock/pull", pullProductStock);

// Customers
router.get("/customers", getCustomers);
router.put("/customers/:id/block", toggleCustomerBlock);

// Orders
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Shipments
router.get("/shipments", getShipments);
router.post("/shipments", createShipment);
router.post("/shipments/shiprocket/:orderId", createShiprocketShipment);
router.put("/shipments/:id", updateShipment);

// Requests (Cancellation, Return, Refund)
router.get("/requests", getRequests);
router.put("/requests/:type/:id", updateRequestStatus);

// Partners & Ledgers
router.get("/partners", getPartners);
router.get("/ledgers/sell-points", getSellPointLedgers);
router.get("/ledgers/income", getIncomeLedgers);

// KYC & Payouts
router.get("/kyc", getKycs);
router.put("/kyc/:id/status", updateKycStatus);
router.get("/payouts", getPayouts);
router.put("/payouts/:id/status", updatePayoutStatus);

// Monthly Closing
router.get("/closing/preview", getClosingPreview);
router.post("/closing/execute", executeClosing);

// Bonanzas
router.get("/bonanzas", getBonanzas);
router.post("/bonanzas", createBonanza);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

export default router;
