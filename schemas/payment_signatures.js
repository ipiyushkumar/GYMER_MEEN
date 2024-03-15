const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: Number },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  totalPayment: { type: Number },
  createdDate: { type: Date, default: Date.now },
  deliveryAddress: { type: String, required: true },
});

const signature = mongoose.model("payment_signatures", signatureSchema);
module.exports = signature;
