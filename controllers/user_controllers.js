const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');

const authLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by phoneNumber (assuming phoneNumber is used for login)
        const user = await User.findOne({ email });
        if (!user) {
            console.log("user does not exist "+ email)
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("password did not match"+ email)
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, phoneNumber: user.phoneNumber }, process.env.Secret_KEY, {
            expiresIn: '1h',
        });

        // Store the token in express-sessions
        req.session.token = token;
        req.session.isLoggedIn = true;

        req.session.userProfile = {
            name: user.name,
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

        console.log("a user logged in " + email)
        res.status(200).json({message : "user logged in successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const authSignUp = async (req, res) => {
    try {
        const { name, email, phone, address, password } = req.body;

        // Check if the name or email is already registered
        const existingUser = await User.findOne({ $or: [{ email }] });
        if (existingUser) {
            console.log("User already Exists\n"+existingUser)
            return res.status(409).json({ message: 'email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const newUser = new User({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Generate JWT token for the newly registered user
        const token = jwt.sign({ userId: newUser._id, username: newUser.username }, process.env.Secret_KEY, {
            expiresIn: '1h',
        });

        // Store the token in express-sessions
        req.session.token = token;
        req.session.isLoggedIn = true;

        req.session.userProfile = {
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            joinDate: newUser.joinDate,
            pincode: newUser.pincode,
            locality: newUser.locality,
            landmark: newUser.landmark,
            city: newUser.city,
            address: newUser.address,
            cart: newUser.cart,
        };

        console.log("a user signed up " + email)
        res.status(200).json({message : "Signed Up successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
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
        const {name, email, phone, pincode, locality, landmark, city, address, cart, purchasedProducts} = req.session.userProfile;

        // Verify the token to get the user's information
        const decodedToken = jwt.verify(token, process.env.Secret_KEY);

        // Find the user data by ID using the decoded information from the token
        const userData = await User.findById(decodedToken.userId);

        if (!userData) {
            console.log("user not found")
            return res.status(404).json({ message: 'User data not found' });
        }

        // Update the user data
        userData.name = name || userData.name;
        userData.email = email || userData.email;
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
        const {name, email, phone, pincode, locality, landmark, city, address} = req.body.userProfile;
        req.session.userProfile.name = name;
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
            res.status(400).json({ message: 'Item already exists in the cart' });
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
    authSignUp, 
    authLogin, 
    authLogout,
    updateProfile,
    getProfile,
    addCartItem,
    removeCartItem,
    increaseCartItemQuantity,
    decreaseCartItemQuantity
};