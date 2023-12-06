const express = require('express');
const router = express.Router();

const controllers = require('../controllers/product_controllers')

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/search/:itemId', controllers.getItemPage);


router.get('/face_care', controllers.face_care)
router.get('/hair_care', controllers.hair_care)
router.get('/body_care', controllers.body_care)
router.get('/beard_care',controllers.beard_care)


module.exports = router;