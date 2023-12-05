const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');
const Orders = require('../schemas/order_schema');

// email
const getOrderByEmail = async (req, res) => {
  try {
    const ordersByEmail = await Orders.find({ email: req.session.userProfile.email });
    res.json(ordersByEmail);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// done
const paymentGateway = async (req, res) => {
  // check if the payment is been done

  const token = req.session.token;

  const payment = req.body.payment || 8968;
  // Verify the token to get the user's information
  const decodedToken = jwt.verify(token, process.env.Secret_KEY);

  // Find the user data by ID using the decoded information from the token
  const userData = await User.findById(decodedToken.userId);

  if (!userData) {
      console.log("user not found")
      return res.status(404).json({ message: 'User data not found' });
  }

  try {
    const newOrder = new Orders({
      email: userData.email,
      products: userData.cart,
      totalPayment: payment
    });
    await newOrder.save();
    userData.cart = [];
    req.session.userProfile.cart = [];
    await userData.save();

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }

  res.status(200).json({message : "The item has been ordered"})
}

module.exports = {
  getOrderByEmail,
  paymentGateway
};