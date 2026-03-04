import express from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', auth, createTransaction);


export default router;