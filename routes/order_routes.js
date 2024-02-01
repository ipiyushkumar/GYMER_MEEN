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

// done
router.get('/api/order',isAuthenticated, controllers.getOrderByEmail);

// add a new order
router.post("/processPayment", controllers.paymentGateway);

router.post("/save/order",isAuthenticated, controllers.saveOrder);

// router.get("/check/order/:id",isAuthenticated, controllers.testAPI);

module.exports = router;