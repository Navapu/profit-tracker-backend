import mongoose from "mongoose"
const options = {
    collection: "transactions",
    strict: true,
    collation: {
        locale: "en",
        strength: 1
    }
};

const transactionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["income", "expense"]
    },
    name:{
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    transactionDate: {
        type: Date,
        required: true
    },
    completionDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["completed", "pending", "canceled", "returned"],
        required: true
    }
}, {timestamps: true}, options)

export const Transaction = mongoose.model('Transaction', transactionSchema)