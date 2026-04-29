import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser, checkMe } from "../controllers/auth.controller.js";
import { auth } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.delete('/logout', auth, logoutUser);
router.post('/me', auth, checkMe);
export default router;