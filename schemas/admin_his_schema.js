const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  email: { type: String, required: true },
  action: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
});

const schema = mongoose.model("adminHistory", historySchema);
module.exports = schema;
