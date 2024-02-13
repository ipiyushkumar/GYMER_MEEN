const express = require("express");
const path = require("path");

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };
  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("Home_page", { content });
});
router.get("/pages/disclaimer", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("Disclaimer", { content });
});

router.get("/pages/privacy-policy", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("privacy-policy", { content });
});

router.get("/pages/about-us", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("about-us", { content });
});

router.get("/pages/refund-policy", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("refund-policy", { content });
});

router.get("/pages/coming-soon", (req, res) => {
  res.render("coming-soon", {});
});

router.get("/pages/blogs", (req, res) => {
  res.render("blogs", {});
});

router.get("/pages/terms-and-conditions", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("terms-and-conditions", { content });
});

router.get("/pages/contact-us", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("Contact_Us", { content });
});

router.get("/pages/shipping-policy", (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };

  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }

  res.render("shipping-policy", { content });
});

router.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(__dirname, "../views/sitemap.xml");
  res.sendFile(sitemapPath);
});

router.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(__dirname, "../assets/robots.txt");
  res.sendFile(robotsPath);
});

router.get("/collections/:page", (req, res) => {
  const { page } = req.params;
  let pageContext = "All";
  let pageMetaTitle, pageMetaDesc;

  switch (page) {
    case "face-care":
      pageContext = "Face Care";
      pageMetaTitle = "Face Care";
      pageMetaDesc =
        "Explore our collection of face care products for a healthy and radiant skin.";
      break;
    case "hair-care":
      pageContext = "Hair Care";
      pageMetaTitle = "Hair Care";
      pageMetaDesc =
        "Discover the best hair care products for healthy, vibrant locks. Explore a wide range of collection including hair removal spray, hair growth oil, and hair powder wax.";
      break;
    case "beard-care":
      pageContext = "Beard Care";
      pageMetaTitle = "Beard Care";
      pageMetaDesc =
        "Level up your beard game! Explore premium beard care products for a groomed and stylish look. Find your grooming essentials now!";
      break;
    case "body-care":
      pageContext = "Body Care";
      pageMetaTitle = "Body Care - WhiteWolf India";
      pageMetaDesc =
        "Discover our range of body care products for smooth and nourished skin. Shop now!";
      break;
    case "skin-care":
      pageContext = "Skin Care";
      pageMetaTitle = "Skin Care - WhiteWolf India";
      pageMetaDesc =
        "Take your grooming routine to a whole new level! Discover best-in-class skincare products for men for an exuberant appearance. From face washes to tint moisturizer skin, hydro booster gel, chemical exfoliator peel cleanser and more.";
      break;
    case "shave":
      pageContext = "Shave";
      pageMetaTitle = "Shave - WhiteWolf India";
      pageMetaDesc =
        "Explore our collection of shaving essentials for a smooth and comfortable shave. Find razors, shaving creams, aftershaves, and more.";
      break;
    case "fragrance":
      pageContext = "Fragrance";
      pageMetaTitle = "Fragrance - WhiteWolf India";
      pageMetaDesc =
        "Discover our exclusive collection of fragrances for men. Find your signature scent today!";
      break;
    default:
      break;
  }
  const content = {
    isLoggedIn: req.session.isLoggedIn,
    context: pageContext,
    metaTitle: pageMetaTitle,
    metaDescription: pageMetaDesc,
  };

  res.render("Product_Listing_page", { content });
});

router.get("/login", (req, res) => {
  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }
  res.render("Auth_page");
});

router.get("/confirm", (req, res) => {
  if (!req.session.userProfile || !req.session.userProfile.cart) {
    req.session.userProfile = { cart: [] };
  }
  let content = { flow: false, code: "" };

  if (req.session.couponCode) {
    content.code = req.session.couponCode;
  }
  if (req.session.flow) {
    content.flow = req.session.flow;
  }
  req.session.flow = false;
  if (!req.session.userProfile.cart[0]) {
    res.status(502).json({ message: "Please Add Items in cart" });
  } else {
    res.render("Order_Confirm_page", { content });
  }
});

router.get("/profile", isAuthenticated, (req, res) => {
  const content = {
    isLoggedIn: req.session.isLoggedIn,
  };
  res.render("User_Profile_page", { content });
});

router.get("/success", isAuthenticated, (req, res) => {
  const content = {
    orderId: req.session.recentOrder,
  };
  res.render("thank_you_page", { content });
});
router.get("/failure", isAuthenticated, (req, res) => {
  res.render("Order_failed");
});

module.exports = router;
