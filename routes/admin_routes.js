const express = require("express");
const router = express.Router();
// Schema and Model definitions here...
const adminHistory = require("../schemas/admin_his_schema");

const controllers = require("../controllers/admin_controllers");

const authenticator = require("../adminConfig");

// Define a middleware to check if the user is authenticated
const isAdminAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    if (authenticator.adminAuthenticater(req.session.email)) {
      next(); // User is authenticated, proceed to the next middleware or route
    } else {
      res.status(401).json({ message: "Administrator credentials required" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
const UserSessionTrack = require("../schemas/user_session_manager");

router.get(
  "/api/admin/getAllUserSessions",
  isAdminAuthenticated,
  async (req, res) => {
    try {
      const allUserSessions = await UserSessionTrack.find();
      res.json(allUserSessions);
    } catch (error) {
      res.status(500).json({ error: "No User in server" });
    }
  }
);

// admin tab
router.get("/adminwolf", isAdminAuthenticated, (req, res) => {
  res.render("Admin_page");
});

const Orders = require("../schemas/order_schema");

router.put(
  "/api/update-order-status/:razorpay_order_id",
  isAdminAuthenticated,
  async (req, res) => {
    const { razorpay_order_id } = req.params;
    const { status } = req.body;

    try {
      // Find the order by razorpay_order_id
      const order = await Orders.findOne({ razorpay_order_id });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update the status
      order.status = status;

      // Save the updated order
      await order.save();

      const ledger = new adminHistory({
        email: req.session.email,
        action: `Updating Order Status Successfull (${razorpay_order_id})`,
      });
      ledger.save();

      return res
        .status(200)
        .json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      const ledger = new adminHistory({
        email: req.session.email,
        action: "Updating order status failed",
      });
      ledger.save();
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const Product = require("../schemas/product_schema");
const multerMiddleware = require("../middlewares/multer");

router.post(
  "/api/products",
  isAdminAuthenticated,
  multerMiddleware.array("imageFiles"),
  // multerMiddleware.array("videoFiles"),
  async (req, res) => {
    try {
      console.log("route started");
      // Check if files are present
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image files uploaded." });
      }

      console.log(req.imageFiles);

      // Retrieve other form data
      const {
        name,
        skuCode,
        description,
        FAQ,
        meta_title,
        meta_description,
        keyFeatures,
        how_to_use,
        newArrival,
        bestSeller,
        originalPrice,
        offeredPrice,
        category,
        stock,
        createdAt,
      } = req.body;

      let imageLink = [];
      req.files.forEach((file) => {
        if (file.fieldname === "imageFiles") {
          imageLink.push(`/uploads/${file.filename}`);
        }
      });
      console.log("loading product");
      // Create a new Product instance
      const newProduct = new Product({
        name,
        skuCode,
        description,
        FAQ,
        meta_title,
        meta_description,
        keyFeatures,
        how_to_use,
        newArrival,
        bestSeller,
        originalPrice,
        offeredPrice,
        category,
        stock,
        imageLink,
        // videoLink,
        createdAt,
      });
      const sanitizedName = name
        .replace(/[#-.]|[[-^]|[?|{}]\s+/g, "-")
        .replace(/\s+/g, "-")
        .toLowerCase();
      newProduct.itemId = sanitizedName;

      console.log("product saved");
      // Save the product to the database
      const savedProduct = await newProduct.save();

      const ledger = new adminHistory({
        email: req.session.email,
        action: `Added New product (${sanitizedName})`,
      });
      ledger.save();

      res.json(savedProduct);
    } catch (error) {
      console.error("Error adding product:", error);
      const ledger = new adminHistory({
        email: req.session.email,
        action: "Failed adding new product",
      });
      ledger.save();
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// PUT route to update an existing product
router.put(
  "/api/products",
  isAdminAuthenticated,
  multerMiddleware.array("imageFiles"),
  async (req, res) => {
    const {
      itemId,
      name,
      skuCode,
      description,
      category,
      keyFeatures,
      FAQ,
      meta_title,
      meta_description,
      stock,
      originalPrice,
      offeredPrice,
      imageFileIndexes,
    } = req.body;

    try {
      // Find the product in the database
      const updateItem = await Product.findOne({ itemId: itemId });

      if (!updateItem) {
        return res.redirect("/error404");
      }

      let imageLink = [];
      req.files.forEach((file) => {
        if (file.fieldname === "imageFiles") {
          imageLink.push(`/uploads/${file.filename}`);
        }
      });

      for (let i = 0; i < imageFileIndexes.length; i++) {
        const index = parseInt(imageFileIndexes[i]);
        if (index >= 0 && index < updateItem.imageLink.length) {
          deleteFiles(updateItem.imageLink[index]);
          updateItem.imageLink[index] = imageLink[i];
        }
      }

      // Update all product properties
      updateItem.name = name || updateItem.name;
      updateItem.description = description || updateItem.description;
      updateItem.FAQ = FAQ || updateItem.FAQ;
      updateItem.skuCode = skuCode || updateItem.skuCode;
      updateItem.meta_title = meta_title || updateItem.meta_title;
      updateItem.meta_description =
        meta_description || updateItem.meta_description;
      updateItem.keyFeatures = keyFeatures || updateItem.keyFeatures;
      updateItem.originalPrice = originalPrice || updateItem.originalPrice;
      updateItem.offeredPrice = offeredPrice || updateItem.offeredPrice;
      updateItem.category = category || updateItem.category;
      updateItem.stock = stock || updateItem.stock;

      // Save the updated product
      await updateItem.save();

      const ledger = new adminHistory({
        email: req.session.email,
        action: `Updated product successfully (${updateItem.itemId})`,
      });
      ledger.save();

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      const ledger = new adminHistory({
        email: req.session.email,
        action: "product updation failed",
      });
      ledger.save();
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;

const fs = require("fs").promises;

router.delete(
  "/api/products/:itemId",
  isAdminAuthenticated,
  async (req, res) => {
    try {
      const deletedProduct = await Product.findOneAndDelete({
        itemId: req.params.itemId,
      });

      if (!deletedProduct) {
        return res.redirect("/error404");
      }

      // Delete images from storage
      if (deletedProduct.imageLink) {
        await Promise.all(deletedProduct.imageLink.map(deleteFiles));
      }

      const ledger = new adminHistory({
        email: req.session.email,
        action: `Product deletion successfull (${deletedProduct.itemId})`,
      });
      ledger.save();

      res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
      const ledger = new adminHistory({
        email: req.session.email,
        action: "product deletion failed",
      });
      ledger.save();
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

async function deleteFiles(path) {
  try {
    // Assuming path contains the full path to the image
    await fs
      .unlink("./" + path)
      .then((response) => console.log(`Deleted image: ${path}`))
      .catch((err) => console.log("image not found for deletion " + err));
  } catch (error) {
    console.error(`Error deleting image ${path}:`, error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

router.get(
  "/api/admin/getAllUsers",
  isAdminAuthenticated,
  controllers.getAllUsers
);

router.get(
  "/api/admin/getAllOrders",
  isAdminAuthenticated,
  controllers.getAllOrders
);

router.get("/coupons", isAdminAuthenticated, controllers.getAllCoupons);

// user route
router.get("/coupons/:code", controllers.getCouponsByCode);

router.post("/coupons", isAdminAuthenticated, controllers.addNewCoupon);

router.delete(
  "/coupons/:code",
  isAdminAuthenticated,
  controllers.deleteCouponByCode
);

router.get("/adminActionHistory", isAdminAuthenticated, async (req, res) => {
  try {
    const completeLedger = await adminHistory.find();
    res.json(completeLedger);
  } catch (error) {
    res.status(500).json({ error: "No User in server" });
  }
});

const Subscriber = require("../schemas/subscriber_schema");

router.get("/api/admin/subscribe", isAdminAuthenticated, async (req, res) => {
  try {
    const allSubscribers = await Subscriber.find();
    res.json(allSubscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
