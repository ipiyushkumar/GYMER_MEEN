const express = require('express');

const router = express.Router();

const controllers = require('../controllers/user_controllers')

// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.post('/auth/login',controllers.authLogin);

router.post('/auth/signup',controllers.authSignUp);

router.get('/logout',controllers.authLogout);

router.put('/updateUserProfile',isAuthenticated, controllers.updateProfile)

router.get('/getprofile',isAuthenticated, controllers.getProfile);

router.post('/addItem', isAuthenticated, controllers.addCartItem);

router.post('/increaseItem', isAuthenticated, controllers.increaseCartItemQuantity);

router.post('/removeItem', isAuthenticated, controllers.removeCartItem);

router.post('/decreaseItem', isAuthenticated, controllers.decreaseCartItemQuantity);

module.exports = router;