import express from 'express';
import { createTransaction, getTransactions, getSummary, getStats } from '../controllers/transaction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/create', auth, createTransaction);
router.get('/summary', auth, getSummary);
router.get('/stats', auth, getStats);
export default router;