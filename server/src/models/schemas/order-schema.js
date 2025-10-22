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
        cardNumber: {
            type: String,
            required: true,
            match: [/^\d{16}$/, 'Неверный формат номера карты'],
        },
        cvc: {
            type: String,
            required: true,
            match: [/^\d{3}$/, 'CVC должен содержать 3 или 4 цифры'],
        },
        expirationDate: {
            type: String,
            required: true,
            match: [/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Неверный формат срока действия (MM/YY)'],
        },
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