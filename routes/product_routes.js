const express = require('express');
const router = express.Router();

const controllers = require('../controllers/product_controllers')

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/search/:itemId', controllers.getItemPage);

module.exports = router;