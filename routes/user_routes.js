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

router.post('/send-otp',controllers.sendOTP);

router.get('/logout',isAuthenticated, controllers.authLogout);

router.put('/updateUserProfile',isAuthenticated, controllers.updateProfile)

router.get('/getprofile', controllers.getProfile);

router.post('/addItem', controllers.addCartItem);

router.post('/increaseItem', controllers.increaseCartItemQuantity);

router.post('/removeItem', controllers.removeCartItem);

router.post('/decreaseItem', controllers.decreaseCartItemQuantity);

router.post('/products/:itemId/reviews',isAuthenticated, controllers.addOrUpdateReview)

router.get('/products/:itemId/reviews',isAuthenticated, controllers.getReview)

const Orders = require('../schemas/order_schema');

// get order track
router.get('/order-track/:razorpay_order_id',isAuthenticated, async (req, res) => {
    const { razorpay_order_id } = req.params;
  
    try {
        // Find the order by razorpay_order_id
        const order = await Orders.findOne({ razorpay_order_id });
  
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.render('Order_tracking',{order});
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/api/order-track/:razorpay_order_id',isAuthenticated, async (req, res) => {
    const { razorpay_order_id } = req.params;
  
    try {
        // Find the order by razorpay_order_id
        const order = await Orders.findOne({ razorpay_order_id });
  
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).send({products : order.products})
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;