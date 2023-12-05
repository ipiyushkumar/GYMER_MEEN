const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');
const Orders = require('../schemas/order_schema');

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await Users.find();
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ error: 'No User in server' });
    }
}
const getAllOrders = async (req,res) => {
    try {
        const allOrders = await Orders.find();
        res.json(allOrders);
    } catch (error) {
        res.status(500).json({ error: 'No User in server' });
    }
}

module.exports = {
    getAllUsers,
    getAllOrders
};