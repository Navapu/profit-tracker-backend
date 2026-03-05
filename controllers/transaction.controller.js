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

export const getTransactions = async (req, res, next) => {
  try{
    const userId = req.user.id;
    const filter = { userId };
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;
    if(req.query.type) filter.type = req.query.type;
    if(req.query.search) filter.name = {$regex: req.query.search, $options: "i"};    
    if(req.query.status) filter.status = req.query.status;
    
    const sortOrder = req.query.order === "asc" ? 1 : -1
        
    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) filter.amount.$gte = Number(req.query.minAmount);
      if (req.query.maxAmount) filter.amount.$lte = Number(req.query.maxAmount);
    }

    if(req.query.startDate || req.query.endDate){
      filter.transactionDate = {};
      if(req.query.startDate) filter.transactionDate.$gte = new Date(req.query.startDate);
      if(req.query.endDate) filter.transactionDate.$lte = new Date(req.query.endDate);
    }


    const totalTransactions = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter).limit(limit).skip(offset).sort({transactionDate: sortOrder})

    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      msg: "Transactions: ",
      data: {
        totalTransactions,
        limit,
        page,
        totalPages,
        transactions
      }
    });
  }catch(error){
    logger.error(error, "getTransactions error:");
    next(error);
  }
};