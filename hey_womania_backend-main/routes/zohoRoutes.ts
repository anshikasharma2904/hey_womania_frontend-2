import express from "express";
import {
  connectZoho,
  getZohoItemById,
  getZohoItemImage,
  getZohoDocumentImage,
  getZohoItems,
  getZohoCategories,
  getZohoCustomers,
  getZohoOrders,
  getZohoStatus,
  handleZohoCallback,
  refreshZohoToken,
  syncZohoItems,
  syncZohoCategories,
  syncZohoCustomers,
  syncZohoOrders,
  handleZohoItemWebhook
} from "../controllers/zohoOAuthController";

const router = express.Router();

router.get("/connect", connectZoho);
router.get("/callback", handleZohoCallback);
router.get("/status", getZohoStatus);
router.post("/refresh-token", refreshZohoToken);

router.get("/items", getZohoItems);
router.get("/items/:itemId", getZohoItemById);
router.get("/items/:itemId/image", getZohoItemImage);
router.get("/documents/:documentId", getZohoDocumentImage);
router.post("/sync-items", syncZohoItems);

router.get("/categories", getZohoCategories);
router.post("/sync-categories", syncZohoCategories);

router.get("/customers", getZohoCustomers);
router.post("/sync-customers", syncZohoCustomers);

router.get("/orders", getZohoOrders);
router.post("/sync-orders", syncZohoOrders);

// Webhooks
router.post("/webhooks/item", handleZohoItemWebhook);

export default router;
