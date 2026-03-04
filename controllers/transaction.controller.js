import logger from "../config/logger.js";
import { Transaction } from "../db/models/index.js";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { type, name, amount, transactionDate } = req.body || {};

    if (!type?.trim() || !name?.trim() || !amount || !transactionDate) {
      res.status(400);
      return next(new Error("type, name, amount and transactionDate are required"));
    };

    if(type !== "income" && type !== "expense"){
        res.status(400);
        return next(new Error("type only can be 'income' or 'expense' "));
    };

    if(name?.trim().length < 3 || name?.trim().length > 100){
        res.status(400);
        return next(new Error("name length has to be higher than 3 and lower than 100"))
    }

    if(isNaN(Number(amount)) || Number(amount) <= 0){
        res.status(400);
        return next(new Error("amount must be a valid number and higher than 0"));
    }

    if (!dateRegex.test(transactionDate)) {
        res.status(400);
        return next(new Error("transactionDate must be in format YYYY-MM-DD"));
    }
    
    const newTransaction = await Transaction.create({
        userId,
        type,
        name,
        amount,
        transactionDate: new Date(transactionDate),
        status: "completed"
    });
    return res.status(201).json({
        msg: "New transaction created",
        data: newTransaction,
        error: false
    });
  } catch (error) {
    logger.error(error, "createTransaction error:");
    next(error);
  }
};
