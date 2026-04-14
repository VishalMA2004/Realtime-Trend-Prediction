import { Router } from "express";
import {
  addSavedStock,
  getAnalysis,
  getDashboard,
  getExchangePage,
  getHistory,
  getPrediction,
  getSavedStocksList,
  getStocks,
  removeSavedStock
} from "../controllers/stockController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard", requireAuth, getDashboard);
router.get("/", requireAuth, getStocks);
router.get("/saved", requireAuth, getSavedStocksList);
router.post("/saved", requireAuth, addSavedStock);
router.delete("/saved/:symbol", requireAuth, removeSavedStock);
router.get("/exchange/:exchange", requireAuth, getExchangePage);
router.get("/history/:symbol", requireAuth, getHistory);
router.get("/prediction/:symbol", requireAuth, getPrediction);
router.post("/analysis", requireAuth, getAnalysis);

export default router;
