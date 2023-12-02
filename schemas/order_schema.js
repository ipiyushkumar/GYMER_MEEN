const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    Date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    product: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'Product',
        quantity: { type: Number, required: true, default: 1 },
        dateAdded: {type: Date, required: true, default : Date.now}
    }],
    totalPayment: {type : Number},
    status: {type: String, default: "Pending", enum : ["Pending","Delivery in progress","Completed"]},
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;