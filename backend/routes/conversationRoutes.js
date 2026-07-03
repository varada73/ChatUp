import express from "express";
import ConversationController from "../controllers/ConversationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/check-connect-code',authMiddleware,ConversationController.checkConnectCode);
router.get('/',authMiddleware,ConversationController.getConversations);

export default router;