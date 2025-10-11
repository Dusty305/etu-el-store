import mongoose from "mongoose";

export default new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    deliveryInfo: {
        address: {
            type: String,
            required: true
        },
        deliveryTime: {
            type: Date,
            required: true
        },
        courierNotes: {
            type: String,
            default: ''
        }
    },
    paymentInfo: {
        method: {
            type: String,
            default: 'CARD'
        },
        status: {
            type: String,
            default: 'PENDING'
        }
    },
    status: {
        type: String,
        enum: ['НОВЫЙ', 'ОПЛАЧЕН', 'ОТМЕНЁН', 'ВЫПОЛНЕН'],
        default: 'НОВЫЙ'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});