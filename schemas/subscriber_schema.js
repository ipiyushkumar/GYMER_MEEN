const mongoose = require("mongoose");

const subSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subs_items: [
    {
      itemId: { type: String },
      dateAdded: { type: Date, required: true, default: Date.now },
    },
  ],
  createdAt: { type: Date, required: true, default: Date.now },
});

const subscriber_model = mongoose.model("Subscriber", subSchema);
module.exports = subscriber_model;
