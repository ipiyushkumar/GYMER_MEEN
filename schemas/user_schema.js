const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: Number },
  pincode: { type: Number },
  locality: { type: String },
  landmark: { type: String },
  city: { type: String },
  address: { type: String },
  cart: [
    {
      itemId: { type: String },
      quantity: { type: Number, required: true, default: 1 },
      dateAdded: { type: Date, required: true, default: Date.now },
    },
  ],
  joinDate: { type: Date, default: Date.now },
});

const user = mongoose.model("User", userSchema);
module.exports = user;
