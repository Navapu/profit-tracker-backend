import express from 'express';
import { createTransaction, getTransactions, getSummary } from '../controllers/transaction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/create', auth, createTransaction);
router.get('/summary', auth, getSummary);
export default router;