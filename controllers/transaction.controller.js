import logger from "../config/logger.js";
import { Transaction } from "../db/models/index.js";
import mongoose from "mongoose";
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { type, name, amount, transactionDate } = req.body || {};

    if (!type?.trim() || !name?.trim() || !amount || !transactionDate) {
      res.status(400);
      return next(
        new Error("type, name, amount and transactionDate are required"),
      );
    }

    if (type !== "income" && type !== "expense") {
      res.status(400);
      return next(new Error("type only can be 'income' or 'expense' "));
    }

    if (name?.trim().length < 3 || name?.trim().length > 100) {
      res.status(400);
      return next(
        new Error("name length has to be higher than 3 and lower than 100"),
      );
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
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
      status: "completed",
    });
    return res.status(201).json({
      msg: "New transaction created",
      data: newTransaction,
      error: false,
    });
  } catch (error) {
    logger.error(error, "createTransaction error:");
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filter = { userId };
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search)
      filter.name = { $regex: req.query.search, $options: "i" };
    if (req.query.status) filter.status = req.query.status;

    const sortOrder = req.query.order === "asc" ? 1 : -1;

    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) filter.amount.$gte = Number(req.query.minAmount);
      if (req.query.maxAmount) filter.amount.$lte = Number(req.query.maxAmount);
    }

    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) filter.transactionDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.transactionDate.$lte = new Date(req.query.endDate);
    }

    const totalTransactions = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .limit(limit)
      .skip(offset)
      .sort({ transactionDate: sortOrder });

    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      msg: "Transactions: ",
      data: {
        totalTransactions,
        limit,
        page,
        totalPages,
        transactions,
      },
    });
  } catch (error) {
    logger.error(error, "getTransactions error:");
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try{
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { type, name, amount, transactionDate, status } = req.body || {};
    const updateData = {};

    if(!type && !name?.trim() && !amount && !transactionDate && !status){
      res.status(400);
      return next(new Error("No fields provided to update the transaction"));
    };

    if(type && type !== "income" && type !== "expense"){
      res.status(400);
      return next(new Error("type only can be 'income' or 'expense'"));
    };
    
    if (name && (name.trim().length < 3 || name.trim().length > 100)) {
      res.status(400);
      return next(
        new Error("name length has to be higher than 3 and lower than 100"),
      );
    };

   if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      res.status(400);
      return next(new Error("amount must be a valid number and higher than 0"));
    }

    if (transactionDate && !dateRegex.test(transactionDate)) {
      res.status(400);
      return next(new Error("transactionDate must be in format YYYY-MM-DD"));
    }
    if(status && (status !== "completed" && status !== "pending" && status !== "canceled" && status !== "returned")){
      res.status(400);
      return next(new Error("status must be 'completed', 'pending', 'canceled' or 'returned'"));
    }

    if(type) updateData.type = type;
    if(name) updateData.name = name.trim();
    if(amount) updateData.amount = Number(amount);
    if(transactionDate) updateData.transactionDate = transactionDate;
    if(status) updateData.status = status;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if(!updatedTransaction){
      res.status(404);
      return next(new Error("transaction not found"));
    }

    return res.status(200).json({
      msg: "Updated transaction: ",
      data: updatedTransaction,
      error: false
    })
  }catch(error){
    logger.error(error, "updateTransaction error:");
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const filter = { userId };
    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) filter.transactionDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.transactionDate.$lte = new Date(req.query.endDate);
    };
    const [summary] = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$userId",
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          balance: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },
    ]);
    const result = summary || {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };
    res.status(200).json({
      msg: "Summary obtained: ",
      data: result,
      error: false,
    });
  } catch (error) {
    logger.error(error, "getSummary error:");
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try{
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const filter = { userId };
    const limit = Number(req.query.months) >= 6 || Number(req.query.months) <= 12 ? Number(req.query.months) : 12;
    
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    
    const end = new Date(); 
    const start = new Date(end);
    
    start.setMonth(end.getMonth() - (limit - 1));
    start.setDate(1); 

    filter.transactionDate = { $gte: start, $lte: end };
    const stats = await Transaction.aggregate([
      {$match: filter},
      {
        $group:{
          _id: {
              year: { $year: "$transactionDate" },
               month: { $month: "$transactionDate" }
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          }
        }
      },
      { $sort:{"_id.year": -1, "_id.month": -1} },
      { $limit: limit }
    ]);
    const results = {};
    
    for(var i = 0; i < limit; i++){
      if(month > i){
        results[`${year}-${String(month-i).padStart(2, '0')}`] = {
          month: `${year}-${String(month-i).padStart(2, '0')}`,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        };
      }else{
        results[`${year - 1}-${String(12 - i + month).padStart(2, '0')}`] = {
          month: `${year - 1}-${String(12 - i + month).padStart(2, '0')}`,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        };
      }
    }
    stats.forEach(stat => {
      const key = `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`;
      if(results[key]){
        results[key] = {
          month: key,
          totalIncome: stat.totalIncome,
          totalExpense: stat.totalExpense,
          balance: stat.totalIncome - stat.totalExpense,
        };
      }
    });
    const resultArray = Object.values(results).reverse();
    res.status(200).json({
      msg: "Stats obtained: ",
      data: resultArray,
      error: false,
    });
  }catch(error){
    logger.error(error, "getStats error:");
    next(error);
  }
};