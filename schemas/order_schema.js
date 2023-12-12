const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    Date: { type: Date, default: Date.now },
    email: { type: String, required: true},
    razorpay_order_id: {type: String},
    razorpay_payment_id: {type:String},
    razorpay_signature: {type:String},
    products: [{
        itemId: {type: String},
        quantity: { type: Number, required: true, default: 1 },
        dateAdded: {type: Date, required: true, default : Date.now}
    }],
    totalPayment: {type : Number},
    status: {type: String, default: "Pending", enum : ["Pending","In progress","Completed"]},
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;