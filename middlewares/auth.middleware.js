import { verifyToken } from "../services/auth.service.js";
import { User } from "../db/models/index.js";
import logger from "../config/logger.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401);
      return next(new Error("required token"));
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      res.status(401);
      return next(new Error("invalid or expired token"));
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404);
      return next(new Error("user not found"));
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401);
    next("Unauthorized");
  }
};