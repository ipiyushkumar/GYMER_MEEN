const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  Date: { type: Date, default: Date.now },
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: Number },
  razorpay_order_id: { type: String },
  pincode: { type: Number },
  locality: { type: String },
  landmark: { type: String },
  city: { type: String },
  address: { type: String },
  products: [
    {
      itemId: { type: String },
      quantity: { type: Number, required: true, default: 1 },
      dateAdded: { type: Date, required: true, default: Date.now },
    },
  ],
  totalPayment: { type: Number },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Sent", "Delivering", "Delivered"],
  },
  createdDate: { type: Date, default: Date.now },
  deliveryAddress: { type: String, required: true },
  deliveryMethod: { type: String, required: true },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
