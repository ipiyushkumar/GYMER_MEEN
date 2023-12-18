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
}