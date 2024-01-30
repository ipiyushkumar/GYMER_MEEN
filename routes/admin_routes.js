const express = require('express');
const router = express.Router();
// Schema and Model definitions here...

const controllers = require('../controllers/admin_controllers')

const authenticator = require('../adminConfig')

// Define a middleware to check if the user is authenticated
const isAdminAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (authenticator.adminAuthenticater(req.session.email)) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.status(401).json({ message: 'Administrator credentials required' });
    }
  } else {
      res.status(401).json({ message: 'Unauthorized' });
  }
};

// admin tab
router.get('/adminwolf',isAdminAuthenticated, (req, res) => {
    res.render('Admin_page');
})

const Orders = require('../schemas/order_schema');

router.put('/api/update-order-status/:razorpay_order_id',isAdminAuthenticated,  async (req, res) => {
  const { razorpay_order_id } = req.params;
  const { status } = req.body;

  try {
      // Find the order by razorpay_order_id
      const order = await Orders.findOne({ razorpay_order_id });

      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Update the status
      order.status = status;
      
      // Save the updated order
      await order.save();

      return res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const Product = require('../schemas/product_schema');
const multerMiddleware = require('../middlewares/multer');

router.post('/api/products',isAdminAuthenticated,  multerMiddleware.array('files') , async (req, res) => {
  try {
    console.log("route started")
    // Check if files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Retrieve other form data
    const { name, description, FAQ, meta_tags, key_ingredients, how_to_use, originalPrice, offeredPrice, category, stock } = req.body;

    console.log("creating image link")
    // Extract file paths from Multer's processed files
    const imageLink = req.files.map((file) => `/uploads/${file.filename}`);

    console.log("loading product")
    // Create a new Product instance
    const newProduct = new Product({
      name,
      description,
      FAQ,
      meta_tags,
      key_ingredients,
      how_to_use,
      originalPrice,
      offeredPrice,
      category,
      stock,
      imageLink,
    });
    const sanitizedName = name.replace(/[#-.]|[[-^]|[?|{}]\s+/g, '-').replace(/\s+/g, '-');
    newProduct.itemId = sanitizedName + "-" + newProduct._id;

    console.log("product saved")
    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/api/products',isAdminAuthenticated,  async (req, res) => {
    const {itemId, offeredPrice, originalPrice, stock} = req.body.formdata
    try {
      console.log(req.body.formdata)
      const updateItem = await Product.findOne({itemId : itemId});
      if (!updateItem) {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.log("yes2")      
      updateItem.offeredPrice = offeredPrice || updateItem.offeredPrice;
      updateItem.originalPrice = originalPrice || updateItem.offeredPrice;
      updateItem.stock = stock || updateItem.stock;

      await updateItem.save();

      res.status(200).json({message : "Product Update successfully"})
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

const fs = require('fs').promises;

router.delete('/api/products/:itemId',isAdminAuthenticated,  async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ itemId: req.params.itemId });

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete images from storage
    await Promise.all(deletedProduct.imageLink.map(deleteImage));

    res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function deleteImage(imagePath) {
  try {
    // Assuming imagePath contains the full path to the image
    await fs.unlink("./"+imagePath);
    console.log(`Deleted image: ${imagePath}`);
  } catch (error) {
    console.error(`Error deleting image ${imagePath}:`, error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

router.get('/api/admin/getAllUsers',isAdminAuthenticated, controllers.getAllUsers)

router.get('/api/admin/getAllOrders',isAdminAuthenticated, controllers.getAllOrders)

router.get("/coupons", isAdminAuthenticated,  controllers.getAllCoupons);

// user route
router.get("/coupons/:code", controllers.getCouponsByCode);

router.post("/coupons",isAdminAuthenticated,  controllers.addNewCoupon);

router.delete("/coupons/:code",isAdminAuthenticated,  controllers.deleteCouponByCode);

module.exports = router;