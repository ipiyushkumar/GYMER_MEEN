const express = require('express');
const router = express.Router();
// Schema and Model definitions here...

const controllers = require('../controllers/admin_controllers')

// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (req.session.admin) {
        next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.status(401).json({ message: 'Administrator credentials required' });
    }
  } else {
      res.status(401).json({ message: 'Unauthorized' });
  }
};

// admin tab
router.get('/adminwolf',(req, res) => {
    res.render('Admin_page');
})

const Product = require('../schemas/product_schema');
const multerMiddleware = require('../middlewares/multer');

router.post('/api/products', multerMiddleware.array('files', 3), async (req, res) => {
  try {
    console.log("route started")
    // Check if files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Retrieve other form data
    const { name, description, originalPrice, offeredPrice, category, stock } = req.body;

    console.log("creating image link")
    // Extract file paths from Multer's processed files
    const imageLink = req.files.map((file) => `/uploads/${file.filename}`);

    console.log("loading product")
    // Create a new Product instance
    const newProduct = new Product({
      name,
      description,
      originalPrice,
      offeredPrice,
      category,
      stock,
      imageLink,
    });

    newProduct.itemId = "item_" + newProduct._id

    console.log("product saved")
    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// under development
// router.put('/api/products/:productId', async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, { new: true });
//     if (!updatedProduct) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     res.json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
// );

const fs = require('fs').promises;

router.delete('/api/products/:itemId', async (req, res) => {
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

router.get('/api/admin/getAllUsers',controllers.getAllUsers)

router.get('/api/admin/getAllOrders',controllers.getAllOrders)


const Coupons = require('../schemas/coupons_schema');

// done
router.get("/coupons", async (req, res) => {
  try {
      const allCoupons = await Coupons.find();
      res.status(200).json(allCoupons);
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a specific coupon by code
// this route is not hindered by admin priviledges
router.get("/coupons/:code", async (req, res) => {
  try {
      const coupon = await Coupons.findOne({ code: req.params.code });
      if (!coupon) {
          return res.status(404).json({ error: "Coupon not found" });
      }
      res.status(200).json(coupon);
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// done
router.post("/coupons", async (req, res) => {
  try {
      const newCoupon = new Coupons(req.body);
      const savedCoupon = await newCoupon.save();
      res.status(201).json({message : "coupon successfully created"});
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// // Update a coupon by code
// router.put("/coupons/:code", async (req, res) => {
//   try {
//       const updatedCoupon = await Coupons.findOneAndUpdate(
//           { code: req.params.code },
//           req.body,
//           { new: true }
//       );
//       if (!updatedCoupon) {
//           return res.status(404).json({ error: "Coupon not found" });
//       }
//       res.status(200).json(updatedCoupon);
//   } catch (error) {
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// done
router.delete("/coupons/:code", async (req, res) => {
  try {
      const deletedCoupon = await Coupons.findOneAndDelete({ code: req.params.code });
      if (!deletedCoupon) {
          return res.status(404).json({ error: "Coupon not found" });
      }
      res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;