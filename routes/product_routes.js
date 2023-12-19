const express = require('express');
const router = express.Router();

const controllers = require('../controllers/product_controllers')

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/search/:itemId', controllers.getItemPage);

router.post('/products/:itemId/reviews',controllers.addOrUpdateReview)

router.get('/products/:itemId/reviews',controllers.getReview)

module.exports = router;