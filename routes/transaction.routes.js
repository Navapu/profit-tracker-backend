import express from 'express';
import { createTransaction, getTransactions, getSummary, getStats, updateTransaction, deleteTransaction } from '../controllers/transaction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/create', auth, createTransaction);
router.put('/update/:transactionId', auth, validateObjectId('transactionId'), updateTransaction);
router.delete('/delete/:transactionId', auth, validateObjectId('transactionId'), deleteTransaction);
router.get('/summary', auth, getSummary);
router.get('/stats', auth, getStats);
export default router;