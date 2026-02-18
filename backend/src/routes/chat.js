import express from 'express';
import { chat, getConversation } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', chat);
router.get('/:sessionId', getConversation);

export default router;
