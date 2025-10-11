import mongoose from "mongoose";

export default new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 120
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
});