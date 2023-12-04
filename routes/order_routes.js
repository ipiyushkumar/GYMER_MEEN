const express = require('express');
const router = express.Router();
// Schema and Model definitions here...

const controllers = require('../controllers/order_controllers')

// Routes for Sales Schema:

// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
      next(); // User is authenticated, proceed to the next middleware or route
  } else {
      res.status(401).json({ message: 'Unauthorized' });
  }
};

router.get('/api/orders', controllers.getAllOrders);

router.get('/api/order/:date', controllers.getOrderByDate);

// done
router.get('/api/order',isAuthenticated, controllers.getOrderByEmail);

router.put('/api/Status', controllers.updateOrderStatus);

// add a new order
router.post("/processPayment",isAuthenticated, controllers.paymentGateway);

module.exports = router;