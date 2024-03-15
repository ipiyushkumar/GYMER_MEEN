const mongoose = require("mongoose");

const couponsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  validityStart: { type: Date, required: true },
  validityEnds: { type: Date, required: true },
  dateCreated: { type: Date, default: Date.now },
});

const Coupons = mongoose.model("Coupons", couponsSchema);
module.exports = Coupons;
