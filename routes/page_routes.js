const express = require('express');

const router = express.Router();

// home
router.get('/',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('index',{content})
})

// authentication
router.get('/login',(req, res) => {
    res.render('login');
})

router.get('/signup',(req, res) => {
    res.render('signup');
})

// user pages

router.get('/product_listing',(req, res) => {
    const content = {
        isLoggedIn : req.session.isLoggedIn,
    }
    res.render('product_listing',{content});
})
router.get('/product_description',(req, res) => {
    res.render('product_description');
})
router.get('/cart',(req, res) => {
    res.render('cart');
})
router.get('/confirm', (req, res) => {
    res.render('orderconfirm')
})
router.get('/profile',(req, res) => {
    res.render('user_profile');
})

// admin tab
router.get('/adminwolf',(req, res) => {
    res.render('adminwolf');
})

module.exports = router;