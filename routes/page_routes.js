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

router.get('/pages/disclaimer', (req, res) => {
    res.render('Disclaimer');
})
router.get('/pages/privacy-policy', (req, res) => {
    res.render('privacy-policy');
});
router.get('/pages/refund-policy', (req, res) => {
    res.render('refund-policy');
});
router.get('/pages/terms-and-conditions', (req, res) => {
    res.render('terms-and-conditions');
})
router.get('/pages/contact-us', (req, res) => {
    res.render('Contact_Us');
});
router.get('/pages/about-us', (req, res) => {
    res.render('about-us');
});
router.get('/pages/shipping-policy', (req, res) => {
    res.render('shipping-policy');
});

router.get('/collections/:page',(req, res) => {
    const { page } = req.params
    let pageContext;
    if (page === "face_care"){
        pageContext = 'Face Care'
    } else if (page === "hair-care") {
        pageContext = 'Hair Care'
    } else if (page === "beard-care") {
        pageContext = 'Beard Care'
    } else if (page === "body-care") {
        pageContext = 'Body Care'
    } else if (page === "skin-care") {
        pageContext = 'Skin Care'
    } else if (page === "shave") {
        pageContext = 'Shave'
    } else if (page === "fragrance") {
        pageContext = 'Fragrance'
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