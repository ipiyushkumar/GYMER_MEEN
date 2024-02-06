const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  itemId: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  FAQ: { type: String },
  keyFeatures: { type: String },
  how_to_use: { type: String },
  meta_title: { type: String },
  meta_description: { type: String },
  newArrival: { type: Boolean, default: true },
  bestSeller: { type: Boolean, default: true },
  ratings: [
    {
      email: { type: String },
      orderId: { type: String },
      rating: { type: Number, default: 0 },
      title: { type: String },
      detail: { type: String },
      dateAdded: { type: Date, default: Date.now },
    },
  ],
  originalPrice: { type: Number, required: true },
  offeredPrice: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  imageLink: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
