const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    itemId: {type: String, unique: true},
    name: { type: String, required: true },
    description: { type: String, required: true },
    ratings: [
        {
            email: { type: String },
            orderId: {type: String},
            rating: { type: Number, default:0 },
            title: {type : String},
            detail: {type:String},
            dateAdded: { type: Date, default: Date.now } 
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