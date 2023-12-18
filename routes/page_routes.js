const express = require('express');

const router = express.Router();


// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// home
router.get('/',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Home_page',{content})
})

router.get('/face_care', (req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Face_Care_page',{content})
})
router.get('/hair_care', (req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Hair_Care_page',{content})
})
router.get('/body_care',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Body_Care_page',{content})
})
router.get('/beard_care',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Beard_Care_page',{content})
})


router.get('/product_listing',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Product_Listing_page',{content});
})



// authentication
router.get('/login',(req, res) => {
    res.render('Auth_page');
})

router.get('/confirm',isAuthenticated, (req, res) => {
    if (!req.session.userProfile.cart[0]){
        res.status(502).json({message : "Please Add Items in cart"})
    } else {
        res.render('Order_Confirm_page')
    }
})

router.get('/profile',isAuthenticated, (req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('User_Profile_page',{content});
})

router.get('/success',isAuthenticated, (req, res) => {
    const content = {
        orderId : req.session.recentOrder
    }
    res.render('thank_you_page',{content});
})
router.get('/failure',isAuthenticated, (req, res) => {
    res.render('Order_failed');
})

module.exports = router;