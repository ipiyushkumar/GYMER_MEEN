const express = require('express');
const router = express.Router();

const controllers = require('../controllers/product_controllers')

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/product/:itemId', controllers.getItemPage);

router.get('/products/:itemId/allReviews',controllers.getAllReviews)

module.exports = router;