const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    itemId: {type: String, unique: true, required: true},
    name: { type: String, required: true },
    description: { type: String, required: true },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min:0, max:10, default:8 }
        }
    ],
    originalPrice: { type: Number, required: true },
    offeredPrice: { type: Number, required: true },
    category: { type: String, required: true, enum : ["Face Care", "Hair Care", "Body Care","Beard Care"] },
    stock: { type: Number, default: 0 },
    imageLink: [{type: String}],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;