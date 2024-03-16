const mongoose = require("mongoose");

const UserSessionTrack = new mongoose.Schema({
  sessionLandingUrl: { type: String, default: "https://whitewolfIndia.com" },
  sessionId: { type: String }, // client session id
  visited: { type: Number, default: 0 }, // if the website was visited
  addedToCart: { type: Number, default: 0 }, // if any item was added to cart
  reachedCheckout: { type: Number, default: 0 }, // if user opened the checkout
  sessionConverted: { type: Number, default: 0 }, /// if user made any purchase
  createdAt: { type: Date, required: true, default: Date.now },
});

const user = mongoose.model("UserSessionTrack", UserSessionTrack);
module.exports = user;
