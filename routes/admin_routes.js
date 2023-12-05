const express = require('express');
const router = express.Router();
// Schema and Model definitions here...

const controllers = require('../controllers/admin_controllers')

// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.session.admin) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.status(401).json({ message: 'Administrator credentials required' });
    }
  } else {
      res.status(401).json({ message: 'Unauthorized' });
  }
};

// admin tab
router.get('/adminwolf',(req, res) => {
    res.render('Admin_page');
})

router.get('/api/admin/getAllUsers',controllers.getAllUsers)

router.get('/api/admin/getAllOrders',controllers.getAllOrders)

module.exports = router;