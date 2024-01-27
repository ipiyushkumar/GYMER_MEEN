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
    if (!req.session.userProfile || !req.session.userProfile.cart) {req.session.userProfile = { cart: [] };}
    
    res.render('Home_page',{content})
})

router.get('/disclaimer', (req, res) => {
    res.render('Disclaimer');
})
router.get('/privacy_policy', (req, res) => {
    res.render('privacy-policy');
})
router.get('/refund-policy', (req, res) => {
    res.render('refund-policy');
})
router.get('/terms-and-conditions', (req, res) => {
    res.render('terms-and-conditions');
})
router.get('/product_listing/:page',(req, res) => {
    const { page } = req.params
    let pageContext;
    if (page === "face_care"){
        pageContext = 'Face Care'
    } else if (page === "hair_care") {
        pageContext = 'Hair Care'
    } else if (page === "beard_care") {
        pageContext = 'Beard Care'
    } else if (page === "body_care") {
        pageContext = 'Body Care'
    } else if (page === "skin_care") {
        pageContext = 'Skin Care'
    } else {
        pageContext = 'all'
    }
    if (!req.session.userProfile || !req.session.userProfile.cart) {req.session.userProfile = { cart: [] };}

    const content = {
        isLoggedIn : req.session.isLoggedIn,
        context: pageContext,
    }
    res.render('Product_Listing_page',{content});
})



// authentication
router.get('/login',(req, res) => {
    if (!req.session.userProfile || !req.session.userProfile.cart) {req.session.userProfile = { cart: [] };}
    res.render('Auth_page');
})

router.get('/confirm', (req, res) => {
    if (!req.session.userProfile || !req.session.userProfile.cart) {req.session.userProfile = { cart: [] };}
    let content = {flow : false, code : ''};

    if (req.session.couponCode) {content.code = req.session.couponCode} 
    if (req.session.flow) {content.flow = req.session.flow} 
    req.session.flow = false;
    if (!req.session.userProfile.cart[0]){
        res.status(502).json({message : "Please Add Items in cart"})
    } else {
        res.render('Order_Confirm_page',{content})
    }
})

router.get('/profile',isAuthenticated, (req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('User_Profile_page',{content});
})

router.get('/privacy-policy', (req, res) => {
    res.render('privacy_policy');
});

router.get('/refund-policy', (req, res) => {
    res.render('refund-policy');
});

router.get('/disclaimer', (req, res) => {
    res.render('disclaimer');
});

router.get('/terms-and-conditions', (req, res) => {
    res.render('terms-and-conditions');
});

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