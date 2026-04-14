import { Router } from "express";
import { chatWithBot, getBotContext } from "../controllers/botController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/context", requireAuth, getBotContext);
router.post("/chat", requireAuth, chatWithBot);

export default router;
