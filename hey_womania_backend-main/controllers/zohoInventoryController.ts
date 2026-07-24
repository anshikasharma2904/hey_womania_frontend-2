import { Request, Response } from "express";
import {
  getZohoInventoryStatus,
  pullAllZohoStock,
  pullZohoStockForProduct,
  syncAllProductsToZoho,
  syncProductToZoho
} from "../services/zohoInventoryService";

export const getZohoStatus = async (_req: Request, res: Response) => {
  res.json(getZohoInventoryStatus());
};

export const syncProduct = async (req: Request, res: Response) => {
  try {
    const result = await syncProductToZoho(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Zoho sync failed" });
  }
};

export const syncAllProducts = async (_req: Request, res: Response) => {
  try {
    const results = await syncAllProductsToZoho();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Zoho sync failed" });
  }
};

export const pullProductStock = async (req: Request, res: Response) => {
  try {
    const result = await pullZohoStockForProduct(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Zoho stock sync failed" });
  }
};

export const pullAllStock = async (_req: Request, res: Response) => {
  try {
    const results = await pullAllZohoStock();
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Zoho stock sync failed" });
  }
};
