const express = require('express');
const router = express.Router();
const Product = require('../schemas/product_schema');

const controllers = require('../controllers/product_controllers')
const multerMiddleware = require('../middlewares/multer');

router.get('/api/products',controllers.getAllProducts);

router.get('/api/products/:itemId', controllers.getProductUsingId);

router.get('/search/:itemId', controllers.getItemPage);

router.post('/api/products', multerMiddleware.array('files', 3), async (req, res) => {
  try {
    console.log("route started")
    // Check if files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Retrieve other form data
    const { itemId, name, description, originalPrice, offeredPrice, category, stock } = req.body;

    console.log("creating image link")
    // Extract file paths from Multer's processed files
    const imageLink = req.files.map((file) => `/uploads/${file.filename}`);


    console.log("loading product")
    // Create a new Product instance
    const newProduct = new Product({
      itemId,
      name,
      description,
      originalPrice,
      offeredPrice,
      category,
      stock,
      imageLink,
    });

    console.log("product saved")
    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/face_care', controllers.face_care)
router.get('/hair_care', controllers.hair_care)
router.get('/body_care', controllers.body_care)
router.get('/beard_care',controllers.beard_care)

// under development
router.put('/api/products/:productId', );

router.delete('/api/products/:productId',controllers.deleteProduct);

module.exports = router;