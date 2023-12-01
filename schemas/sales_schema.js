const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    Date: { type: Date, default: Date.now },
    soldProduct : [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 },
            price: {type : Number},
            timeStanp: {type: Date, default: Date.now}
        }
    ],
    requestedProduct : [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 },
            price: {type : Number},
            timeStanp: {type: Date, default: Date.now}
        }
    ]
});

const Product = mongoose.model("Sales", productSchema);
module.exports = Product;