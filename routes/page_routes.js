const express = require('express');

const router = express.Router();

// home
router.get('/',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Home_page',{content})
})

// authentication
router.get('/login',(req, res) => {
    res.render('Auth_page');
})

// user pages

router.get('/product_listing',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Product_Listing_page',{content});
})

// change it in product controller
// router.get('/product_description',(req, res) => {
//     res.render('product_description');
// })

router.get('/confirm', (req, res) => {
    res.render('Order_Confirm_page')
})

router.get('/profile',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('User_Profile_page',{content});
})

router.get('/paymentGateway', (req, res) => {
    res.render('paymentGateway_page')
})

module.exports = router;