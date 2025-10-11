import mongoose from 'mongoose';
import cartSchema from './schemas/cart-schema.js';

export default mongoose.model('Cart', cartSchema);