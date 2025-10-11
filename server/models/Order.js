import mongoose from 'mongoose';
import orderSchema from './schemas/order-schema.js';

export default mongoose.model('Order', orderSchema);