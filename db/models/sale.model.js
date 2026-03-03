import mongoose from "mongoose"
const options = {
    collection: "sales",
    strict: true,
    collation: {
        locale: "en",
        strength: 1
    }
};

const saleSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    saleDate: {
        type: Date,
        required: true
    },
    shippingDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["sold", "shipped", "canceled", "returned"],
        required: true
    }
}, {timestamps: true}, options)

export const Sale = mongoose.model('Sale', saleSchema)