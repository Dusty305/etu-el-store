import mongoose from 'mongoose';
import productSchema from './schemas/product-schema.js';

export default mongoose.model('Product', productSchema);