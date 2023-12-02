const express = require('express');
const router = express.Router();
// Schema and Model definitions here...

const Sales = require('../schemas/sales_schema'); // Assuming Sales model is defined

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

// 1. Get all sales
router.get('/api/orders', controllers.getAllOrders);

// 2. Get sales by date
router.get('/api/order/:date', controllers.getOrderByDate);

// 3. Get all sold products
router.get('/api/order', controllers.getOrderByEmail);

// 5. Add a new sale
router.post('/api/placeOrder', isAuthenticated, controllers.placeNewOrder);

// 6. Update a sale by ID
router.put('/api/Status', controllers.updateOrderStatus);

module.exports = router;