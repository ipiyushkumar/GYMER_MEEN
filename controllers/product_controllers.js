const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');

const getAllProducts = async (req, res) => {
    try {
      const allProducts = await Product.find();
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
} 

const getProductUsingId = async (req, res) => {
    try {
      const itemId = req.params.itemId
      const item = await Product.findOne({itemId});
      if (!item) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

const addNewItem = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// under development

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndRemove(req.params.productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const face_care = (req, res) => {
  const content = {
      isLoggedIn : req.session.isLoggedIn,
  }
  res.render('Face_Care_page',{content})
}
const hair_care = (req, res) => {
  const content = {
      isLoggedIn : req.session.isLoggedIn,
  }
  res.render('Hair_Care_page',{content})
}
const body_care = (req, res) => {
  const content = {
      isLoggedIn : req.session.isLoggedIn,
  }
  res.render('Body_Care_page',{content})
}
const beard_care = (req, res) => {
  const content = {
      isLoggedIn : req.session.isLoggedIn,
  }
  res.render('Beard_Care_page',{content})
}

const getItemPage = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const item = await Product.findOne({itemId});
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const content = {
      isLoggedIn : req.session.isLoggedIn,
    }
    res.render('Product_Description_page',{item,content})
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
module.exports = {
    getAllProducts,
    getProductUsingId,
    getItemPage,
    addNewItem,
    updateProduct,
    deleteProduct,
    face_care,
    hair_care,
    body_care,
    beard_care
}