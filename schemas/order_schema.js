const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    Date: { type: Date, default: Date.now },
    email: { type: String, required: true},
    products: [{
        itemId: {type: String},
        quantity: { type: Number, required: true, default: 1 },
        dateAdded: {type: Date, required: true, default : Date.now}
    }],
    totalPayment: {type : Number},
    status: {type: String, default: "Pending", enum : ["Pending","Delivery in progress","Completed"]},
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;