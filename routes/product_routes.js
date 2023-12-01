const express = require('express');
const router = express.Router();

const controllers = require('../controllers/product_controllers')

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/search/:itemId', controllers.getItemPage);

router.post('/api/products', controllers.addNewItem);

// under development
router.put('/api/products/:productId', );

router.delete('/api/products/:productId',controllers.deleteProduct);

module.exports = router;