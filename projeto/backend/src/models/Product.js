import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        id: { type: String, default:'' },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('Product', productSchema);
