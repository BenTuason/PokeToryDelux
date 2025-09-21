import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: { type: String, required: true },
    set: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    rarity: { type: String, required: true },
    marketPrice: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Card', cardSchema);