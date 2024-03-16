const express = require("express");
const session = require("express-session");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const User = require("../schemas/user_schema");
const Product = require("../schemas/product_schema");

const nodemailer = require("nodemailer");
const randomize = require("randomatic");

const loginMail = (req, res) => {
  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_ID, // replace with your email
      pass: process.env.MAIL_PASS, // replace with your password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: req.session.email,
    subject: `Welcome to WhiteWolf India 🟢`,
    html: `
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <img src="https://i.ibb.co/0GQgmn7/whitewolflog.png" alt="Whitewolf India Logo" style="width: 50px; height: auto;">
            <h2 style="color: #333; margin-top: 20px;">WhiteWolf India</h2>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Dear New User,</p>
            <p style="font-size: 18px; color: #333;">Welcome to WhiteWolf India!</p>
            <p style="font-size: 16px; color: #333;">Thank you for joining our platform. Your registration is successful.</p>
            <p style="font-size: 16px; color: #333;">For any assistance or inquiries, feel free to contact our support team - 180021020016</p>
            <p>care@whitewolfindia.com</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Best Regards,</p>
            <p style="font-size: 18px; color: #333;">WhiteWolf India Team</p>
          </div>
        `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const adminMail = (req, res) => {
  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_ID, // replace with your email
      pass: process.env.MAIL_PASS, // replace with your password
    },
  });

  const recipients = ["akshatgarg071@gmail.com", "chetan@born16.com"];
  const mailOptions = {
    from: process.env.MAIL_ID,
    to: recipients.join(","),
    subject: `New User Registration - WhiteWolf India 🟢`,
    html: `
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <img src="https://i.ibb.co/0GQgmn7/whitewolflog.png" alt="Whitewolf India Logo" style="width: 50px; height: auto;">
            <h2 style="color: #333; margin-top: 20px;">WhiteWolf India</h2>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Dear Admin,</p>
            <p style="font-size: 18px; color: #333;">A new user has registered on WhiteWolf India:</p>
            <p style="font-size: 16px; color: #333;">Email: <strong style="color: #007bff;">${req.session.email}</strong></p>
            <p style="font-size: 16px; color: #333;">Thank You</p>
            <!-- <p style="font-size: 16px; color: #333;">For any further information, feel free to reach out.</p> -->
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Best Regards,</p>
            <p style="font-size: 18px; color: #333;">WhiteWolf India Team</p>
          </div>
        `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const authLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const storedOTP = req.session.OTP;
    if (otp !== storedOTP) {
      console.log("Invalid OTP for user: " + email);
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Check if the user exists by email
    let user = await User.findOne({ email });

    if (user) {
      // User is already registered
      req.session.isLoggedIn = true;
      req.session.OTP = "";
      req.session.email = email;
      req.session.userProfile.email = email;

      if (req.session.userProfile.cart[0]) {
        // User has a filled cart, save the profile and complete the order

        console.log("user already exists completing cart");

        saveUserProfile(req, res);
        return res.status(201).json({ message: "Completing order" });
      }

      const userProfile = {
        name: user.name || req.session.userProfile.name,
        email: user.email || req.session.userProfile.email,
        phone: user.phone || req.session.userProfile.phone,
        joinDate: user.joinDate || req.session.userProfile.joinDate,
        pincode: user.pincode || req.session.userProfile.pincode,
        locality: user.locality || req.session.userProfile.locality,
        landmark: user.landmark || req.session.userProfile.landmark,
        city: user.city || req.session.userProfile.city,
        address: user.address || req.session.userProfile.address,
        cart: user.cart || req.session.userProfile.cart,
      };

      req.session.userProfile = userProfile;

      console.log("user already exists but nothing in cart");

      // User is coming without a filled cart
      req.session.userProfile = userProfile;
      console.log("User logged in successfully: " + email);
      loginMail(req, res);
      adminMail(req, res);
      return res.status(200).json({ message: "User logged in successfully" });
    } else {
      // User is not registered, register for the first time
      console.log("User does not exist. Adding user with email: " + email);
      user = new User({ email });
      await user.save();

      // Load necessary data into the session
      req.session.isLoggedIn = true;
      req.session.email = email;
      req.session.OTP = "";
      req.session.userProfile.email = email;

      if (req.session.userProfile.cart[0]) {
        // User has a filled cart, save the profile and complete the order
        console.log("user does not exist and completing cart");

        saveUserProfile(req, res);
        return res.status(201).json({ message: "Completing order" });
      }
      console;
      // Define userProfile here
      const userProfile = {
        name: user.name || req.session.userProfile.name,
        email: user.email || req.session.userProfile.email,
        phone: user.phone || req.session.userProfile.phone,
        joinDate: user.joinDate || req.session.userProfile.joinDate,
        pincode: user.pincode || req.session.userProfile.pincode,
        locality: user.locality || req.session.userProfile.locality,
        landmark: user.landmark || req.session.userProfile.landmark,
        city: user.city || req.session.userProfile.city,
        address: user.address || req.session.userProfile.address,
        cart: user.cart || req.session.userProfile.cart,
      };
      req.session.userProfile = userProfile;

      console.log("user does not exist and not completing");

      console.log("User registered and logged in successfully: " + email);
      loginMail(req, res);
      adminMail(req, res);
      res
        .status(200)
        .json({ message: "User registered and logged in successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendOTP = (req, res) => {
  const userEmail = req.body.email;

  // Generate OTP
  const otp = randomize("0", 6);

  // Send OTP to the user's email
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_ID, // replace with your email
      pass: process.env.MAIL_PASS, // replace with your password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_ID,
    to: userEmail,
    subject: `OTP for Authentication - ${otp} from WhiteWolf India 🟢`,
    html: `
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <img src="https://i.ibb.co/0GQgmn7/whitewolflog.png" alt="Whitewolf India Logo" style="width: 50px; height: auto;">
            <h2 style="color: #333; margin-top: 20px;">WhiteWolf India</h2>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Dear User,</p>
            <p style="font-size: 18px; color: #333;">Your OTP for Authentication is: <strong style="color: #007bff;">${otp}</strong></p>
            <p style="font-size: 16px; color: #333;">Thank you for choosing WhiteWolf India. We appreciate your trust in our service.</p>
            <p style="font-size: 16px; color: #333;">For any assistance or inquiries, feel free to contact our support team - 180021020016</p>
            <p>care@whitewolfindia.com</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Best Regards,</p>
            <p style="font-size: 18px; color: #333;">WhiteWolf India Team</p>
          </div>
        `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending OTP.");
    } else {
      console.log("Email sent: " + info.response);
      req.session.OTP = otp;
      res.status(200).send("OTP sent successfully.");
    }
  });
};
const authLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      res.redirect("/");
    }
  });
};
const saveUserProfile = async (req, res) => {
  try {
    const { name, phone, pincode, locality, landmark, city, address, cart } =
      req.session.userProfile;

    // Find the user data by ID using the decoded information from the token
    const userData = await User.findOne({ email: req.session.email });

    if (!userData) {
      console.log("user not found");
      return res.status(404).json({ message: "User data not found" });
    }

    // Update the user data
    userData.name = name || userData.name;
    userData.phone = phone || userData.phone;
    userData.pincode = pincode || userData.pincode;
    userData.locality = locality || userData.locality;
    userData.landmark = landmark || userData.landmark;
    userData.city = city || userData.city;
    userData.address = address || userData.address;
    userData.cart = cart || userData.cart;

    // Save the updated user data
    await userData.save();

    console.log("user data updated successfully");
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, phone, pincode, locality, landmark, city, address } =
      req.body.userProfile;
    req.session.userProfile.name = name;
    req.session.userProfile.phone = phone;
    req.session.userProfile.pincode = pincode;
    req.session.userProfile.locality = locality;
    req.session.userProfile.landmark = landmark;
    req.session.userProfile.city = city;
    req.session.userProfile.address = address;
    saveUserProfile(req, res);
    res.status(200).json({ message: "user profile updated successfully" });
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};
const getProfile = async (req, res) => {
  res.status(200).json({
    message: "User profile loaded successfully",
    userProfile: req.session.userProfile,
  });
};
const UserSessionTrack = require("../schemas/user_session_manager");

const addCartItem = async (req, res) => {
  const { itemId } = req.body;
  const userProfile = req.session.userProfile;

  try {
    // Check if the item already exists in the cart
    const existingItem = userProfile.cart.find(
      (item) => item.itemId === itemId
    );

    if (existingItem) {
      // If the item already exists, increase its quantity by one
      existingItem.quantity += 1;

      // Save the updated user profile in the session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({
          message: "Quantity increased in cart",
          userProfile,
          quantity: existingItem.quantity,
        });
      });
    } else {
      // If the item doesn't exist, add it to the cart
      const item = await Product.findOne({ itemId });
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      userProfile.cart.push({
        itemId: item.itemId,
        quantity: 1,
      });

      // Save the updated user profile in the session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        UserSessionTrack.findOne({ sessionId: req.sessionID })
          .then((userSession) => {
            if (userSession) {
              userSession.visited += 1;
              userSession.addedToCart += 1;
              return userSession.save();
            } else {
              const newUserSession = new UserSessionTrack({
                sessionId: req.sessionID,
              });
              return newUserSession.save(); // Save new session
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        res.status(200).json({
          message: "Item added to cart successfully",
          userProfile,
          quantity: 1,
        });
      });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const removeCartItem = (req, res) => {
  const { itemId } = req.body;
  const userProfile = req.session.userProfile;

  try {
    // Find the item in the user's cart
    const cartItem = userProfile.cart.find((item) => item.itemId === itemId);

    if (cartItem) {
      // Remove the item from the cart
      const itemIndex = userProfile.cart.indexOf(cartItem);
      userProfile.cart.splice(itemIndex, 1);

      // Save the updated user profile in the session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({
          message: "Item removed from cart successfully",
          newQuantity: -1,
        });
      });
    } else {
      res.status(404).json({ message: "Item not found in the cart" });
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const increaseCartItemQuantity = (req, res) => {
  const { itemId } = req.body;
  const userProfile = req.session.userProfile;

  try {
    // Find the item in the user's cart
    const cartItem = userProfile.cart.find((item) => item.itemId === itemId);

    if (cartItem) {
      // Increase the quantity of the item
      cartItem.quantity += 1;

      // Save the updated user profile in the session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        UserSessionTrack.findOne({ sessionId: req.sessionID })
          .then((userSession) => {
            if (userSession) {
              userSession.visited += 1;
              userSession.addedToCart += 1;
              return userSession.save();
            } else {
              const newUserSession = new UserSessionTrack({
                sessionId: req.sessionID,
              });
              return newUserSession.save(); // Save new session
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        res.status(200).json({
          message: "Item quantity increased successfully",
          newQuantity: cartItem.quantity,
        });
      });
    } else {
      res.status(404).json({ message: "Item not found in the cart" });
    }
  } catch (error) {
    console.error("Error increasing item quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const decreaseCartItemQuantity = (req, res) => {
  const { itemId } = req.body;
  const userProfile = req.session.userProfile;

  try {
    // Find the item in the user's cart
    const cartItem = userProfile.cart.find((item) => item.itemId === itemId);

    if (cartItem) {
      // Decrease the quantity if greater than 1; otherwise, remove the item
      if (cartItem.quantity > 1) {
        cartItem.quantity--;

        // Save the updated user profile in the session
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ message: "Internal server error" });
          }
          res.status(200).json({
            message: "Item quantity decreased successfully",
            newQuantity: cartItem.quantity,
          });
        });
      } else {
        // Remove the item from the cart if quantity is 1
        const itemIndex = userProfile.cart.indexOf(cartItem);
        userProfile.cart.splice(itemIndex, 1);

        // Save the updated user profile in the session
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ message: "Internal server error" });
          }
          res.status(200).json({
            message: "Item removed from cart successfully",
            newQuantity: -1,
          });
        });
      }
    } else {
      res.status(404).json({ message: "Item not found in the cart" });
    }
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Route to push a new review or update an existing one
const addOrUpdateReview = async (req, res) => {
  try {
    const { orderId, rating, title, detail } = req.body;
    const { email } = req.session;

    // Find the product by itemId
    const product = await Product.findOne({ itemId: req.params.itemId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if a review with the given orderId already exists
    const existingReviewIndex = product.ratings.findIndex(
      (r) => r.email === email && r.orderId === orderId
    );

    if (existingReviewIndex !== -1) {
      // Update the existing review
      product.ratings[existingReviewIndex] = {
        name: req.session.userProfile.name,
        email,
        orderId,
        rating,
        title,
        detail,
        dateAdded: new Date(),
      };
    } else {
      // Add a new review to the ratings array
      product.ratings.push({
        name: req.session.userProfile.name,
        email,
        orderId,
        rating,
        title,
        detail,
        dateAdded: new Date(),
      });
    }

    // Save the updated product with the new or updated review
    await product.save();

    res
      .status(201)
      .json({ message: "Review added or updated successfully", product });
  } catch (error) {
    console.error("Error adding or updating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Route to get a review based on email and orderId
const getReview = async (req, res) => {
  try {
    const { orderId } = req.body;
    const { email } = req.session;

    // Find the product by itemId
    const product = await Product.findOne({ itemId: req.params.itemId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the review based on email and orderId
    let review = product.ratings.find(
      (r) => r.email === email && r.orderId === orderId
    );

    if (!review) {
      review = {
        email: req.session.email,
        orderId: orderId,
        rating: 0,
        title: "",
        detail: "",
        dateAdded: Date.now(),
      };
    }

    res.status(200).json({ message: "Review found successfully", review });
  } catch (error) {
    console.error("Error getting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendOTP,
  authLogin,
  authLogout,
  updateProfile,
  getProfile,
  addCartItem,
  removeCartItem,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  addOrUpdateReview,
  getReview,
};
