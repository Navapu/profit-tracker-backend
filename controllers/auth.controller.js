import logger from "../config/logger.js";
import { User } from "../db/models/index.js";
import { hashPassword, issueToken, issueRefreshToken } from "../services/auth.service.js";
import crypto from 'crypto';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};

    if (!email?.trim() || !username?.trim() || !password?.trim()) {
      res.status(400);
      return next(new Error("email, username and password are required"));
    }

    const existsUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existsUser) {
      res.status(400);
      return next(new Error("email or username already exists"));
    }

    if (!emailRegex.test(email)) {
      res.status(400);
      return next(new Error("invalid email format"));
    }

    if (username.length < 3 || username.length > 20) {
      res.status(400);
      return next(new Error("username must be between 3 and 20 characters"));
    }

    if (password.length < 6 || password.length > 50) {
      res.status(400);
      return next(new Error("password must be between 6 and 50 characters"));
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
        email,
        username,
        password: hashedPassword 
    })
    const token = issueToken({
        id: newUser._id,
        email: newUser.email
    })
    const refreshToken = issueRefreshToken({
        id: newUser._id,
        email: newUser.email
    })
    const id = crypto.randomBytes(16).toString("hex");

    const refreshTokenHashed = await hashPassword(refreshToken);
    
    newUser.refreshTokens.push({
      id,
      token: refreshTokenHashed,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    await newUser.save();

    return res.status(201).json({
      msg: "Registered user",
      data: {
        email: newUser.email,
        username: newUser.username,
        token,
        refreshToken,
        refreshToken_id: id
      },
      error: false,
    });
  } catch (error) {
    logger.error(error, "registerUser error:");
    next(error);
  }
};
