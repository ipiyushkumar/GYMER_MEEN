const express = require('express');
const session = require('express-session');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const User = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');

const nodemailer = require('nodemailer');
const randomize = require('randomatic');

const authLogin = async (req, res) => {
    try {
        const { email, otp } = req.body

        // Verify OTP
        const storedOTP = req.session.OTP;
        if (otp !== storedOTP) {
            console.log("Invalid OTP for user: " + email);
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        // Check if the user exists by email
        let user = await User.findOne({ email });

        // If the user does not exist, create a new user with the email
        if (!user) {
            console.log("User does not exist. Adding user with email: " + email);
            user = new User({ email });
            await user.save();
        }

        // Load necessary data into the session
        req.session.isLoggedIn = true;
        req.session.email = email
        req.session.userProfile = {
            email: user.email,
            phone: user.phone,
            joinDate: user.joinDate,
            pincode: user.pincode,
            locality: user.locality,
            landmark: user.landmark,
            city: user.city,
            address: user.address,
            cart: user.cart,
        };
        req.session.OTP = '';
        console.log("User logged in successfully: " + email);
        res.status(200).json({ message: "User logged in successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const sendOTP = (req, res) => {
    const userEmail = req.body.email;
  
    // Generate OTP
    const otp = randomize('0', 6);
  
    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, 
      port: process.env.MAIL_PORT, 
      secure: true,
      auth: {
        user: process.env.MAIL_ID, // replace with your email
        pass: process.env.MAIL_PASS // replace with your password
      }
    });

    console.log(process.env.MAIL_ID)
    console.log(process.env.MAIL_PASS)
  
    const mailOptions = {
      from: process.env.MAIL_ID, // replace with your email
      to: userEmail,
      subject: `OTP for Authentication - ${otp}`,
      text: `Your OTP is: ${otp} \n\n\n Thankyou, for using our service`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending OTP.');
      } else {
        console.log('Email sent: ' + info.response);
        req.session.OTP = otp;
        res.status(200).send('OTP sent successfully.');
      }
    });
}
const authLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            res.redirect('/');
        }
    });
};
const saveUserProfile = async (req,res) => {
    const token = req.session.token;
    try {
        const {phone, pincode, locality, landmark, city, address, cart} = req.session.userProfile;

        // Find the user data by ID using the decoded information from the token
        const userData = await User.findOne({ email : req.session.email });

        if (!userData) {
            console.log("user not found")
            return res.status(404).json({ message: 'User data not found' });
        }

        // Update the user data
        userData.phone = phone || userData.phone;
        userData.pincode = pincode || userData.pincode;
        userData.locality = locality || userData.locality;
        userData.landmark = landmark || userData.landmark;
        userData.city = city || userData.city;
        userData.address = address || userData.address;
        userData.cart = cart || userData.cart;

        // Save the updated user data
        await userData.save();

        console.log("user data updated successfully")
    } catch (error) {
        console.error('Error updating user data:', error);
    }
};
const updateProfile = async (req,res) => {
    try {
        const {phone, pincode, locality, landmark, city, address} = req.body.userProfile;
        req.session.userProfile.phone = phone;
        req.session.userProfile.pincode = pincode;
        req.session.userProfile.locality = locality;
        req.session.userProfile.landmark = landmark;
        req.session.userProfile.city = city;
        req.session.userProfile.address = address;
        saveUserProfile(req, res)
        res.status(200).json({message : "user profile updated successfully"})
    } catch (error) {
        console.error('Error updating user data:', error);
    }

}
const getProfile = async (req, res) => {
    res.status(200).json({ message: 'User profile loaded successfully', userProfile: req.session.userProfile });
};
const addCartItem = async (req, res) => {
    const { itemId } = req.body;
    const userProfile = req.session.userProfile;

    try {
        // Check if the item already exists in the cart
        const existingItem = userProfile.cart.find(item => item.itemId === itemId);

        if (existingItem) {
            // If the item already exists, increase its quantity by one
            existingItem.quantity += 1;

            // Save the updated user profile in the session
            req.session.save(err => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                saveUserProfile(req, res);
                res.status(200).json({ message: 'Quantity increased in cart', userProfile });
            });
        } else {
            // If the item doesn't exist, add it to the cart
            const item = await Product.findOne({ itemId });
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            userProfile.cart.push({
                itemId: item.itemId,
                quantity: 1
            });

            // Save the updated user profile in the session
            req.session.save(err => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                saveUserProfile(req, res);
                res.status(200).json({ message: 'Item added to cart successfully', userProfile });
            });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const removeCartItem = (req, res) => {
    const { itemId } = req.body;
    const userProfile = req.session.userProfile;

    try {
        // Find the item in the user's cart
        const cartItem = userProfile.cart.find(item => item.itemId === itemId);

        if (cartItem) {
            // Remove the item from the cart
            const itemIndex = userProfile.cart.indexOf(cartItem);
            userProfile.cart.splice(itemIndex, 1);

            // Save the updated user profile in the session
            req.session.save(err => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                saveUserProfile(req, res);
                res.status(200).json({ message: 'Item removed from cart successfully', newQuantity : -1 });
            });
        } else {
            res.status(404).json({ message: 'Item not found in the cart' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const increaseCartItemQuantity = (req, res) => {
    const { itemId } = req.body;
    const userProfile = req.session.userProfile;

    try {
        // Find the item in the user's cart
        const cartItem = userProfile.cart.find(item => item.itemId === itemId);

        if (cartItem) {
            // Increase the quantity of the item
            cartItem.quantity += 1;

            // Save the updated user profile in the session
            req.session.save(err => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                saveUserProfile(req, res);
                res.status(200).json({ message: 'Item quantity increased successfully', newQuantity : cartItem.quantity });
            });
        } else {
            res.status(404).json({ message: 'Item not found in the cart' });
        }
    } catch (error) {
        console.error('Error increasing item quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const decreaseCartItemQuantity = (req, res) => {
    const { itemId } = req.body;
    const userProfile = req.session.userProfile;

    try {
        // Find the item in the user's cart
        const cartItem = userProfile.cart.find(item => item.itemId === itemId);

        if (cartItem) {
            // Decrease the quantity if greater than 1; otherwise, remove the item
            if (cartItem.quantity > 1) {
                cartItem.quantity--;

                // Save the updated user profile in the session
                req.session.save(err => {
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    saveUserProfile(req, res);
                    res.status(200).json({ message: 'Item quantity decreased successfully', newQuantity : cartItem.quantity });
                });
            } else {
                // Remove the item from the cart if quantity is 1
                const itemIndex = userProfile.cart.indexOf(cartItem);
                userProfile.cart.splice(itemIndex, 1);

                // Save the updated user profile in the session
                req.session.save(err => {
                    if (err) {
                        console.error('Error saving session:', err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    saveUserProfile(req, res);
                    res.status(200).json({ message: 'Item removed from cart successfully', newQuantity : -1 });
                });
            }
        } else {
            res.status(404).json({ message: 'Item not found in the cart' });
        }
    } catch (error) {
        console.error('Error updating item quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
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
    decreaseCartItemQuantity
};