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
// Route to push a new review or update an existing one
const addOrUpdateReview = async (req, res) => {
  try {
      const { orderId, rating, title, detail } = req.body;
      const { email } = req.session;

      // Find the product by itemId
      const product = await Product.findOne({ itemId: req.params.itemId });

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Check if a review with the given orderId already exists
      const existingReviewIndex = product.ratings.findIndex(
          (r) => r.email === email && r.orderId === orderId
      );

      if (existingReviewIndex !== -1) {
          // Update the existing review
          product.ratings[existingReviewIndex] = {
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

      res.status(201).json({ message: 'Review added or updated successfully', product });
  } catch (error) {
      console.error('Error adding or updating review:', error);
      res.status(500).json({ message: 'Internal server error' });
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
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the review based on email and orderId
        let review = product.ratings.find((r) => r.email === email && r.orderId === orderId);

        if (!review) {
            review =  {
              email : req.session.email,
              orderId : orderId,
              rating: 0,
              title: '',
              detail: '',
              dateAdded: Date.now()
            }
        }

        res.status(200).json({ message: 'Review found successfully', review });
    } catch (error) {
        console.error('Error getting review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getAllProducts,
    getProductUsingId,
    getItemPage,
    addOrUpdateReview,
    getReview
}