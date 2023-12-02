const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Schema and Model definitions here...

const Sales = require('../schemas/sales_schema'); // Assuming Sales model is defined

// Routes for Sales Schema:

// 1. Get all sales
router.get('/api/sales', async (req, res) => {
  try {
    const allSales = await Sales.find();
    res.json(allSales);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get sales by date
router.get('/api/sales/:date', async (req, res) => {
  try {
    const salesByDate = await Sales.find({ Date: new Date(req.params.date) });
    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Get all sold products
router.get('/api/sales/soldProducts', async (req, res) => {
  try {
    const allSoldProducts = await Sales.find({}, 'soldProduct');
    res.json(allSoldProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Get all requested products
router.get('/api/sales/requestedProducts', async (req, res) => {
  try {
    const allRequestedProducts = await Sales.find({}, 'requestedProduct');
    res.json(allRequestedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Add a new sale
router.post('/api/sales', async (req, res) => {
  try {
    const newSale = new Sales(req.body);
    const savedSale = await newSale.save();
    res.json(savedSale);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Update a sale by ID
router.put('/api/sales/:saleId', async (req, res) => {
  try {
    const updatedSale = await Sales.findByIdAndUpdate(req.params.saleId, req.body, { new: true });
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. Delete a sale by ID
router.delete('/api/sales/:saleId', async (req, res) => {
  try {
    const deletedSale = await Sales.findByIdAndRemove(req.params.saleId);
    res.json(deletedSale);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;