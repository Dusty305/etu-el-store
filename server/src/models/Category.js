import mongoose from 'mongoose';
import categorySchema from './schemas/category-schema.js';

export default mongoose.model('Category', categorySchema);