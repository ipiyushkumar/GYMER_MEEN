const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user_schema');
const Product = require('../schemas/product_schema');
const Orders = require('../schemas/order_schema');
const Coupons = require('../schemas/coupons_schema');


// email
const getOrderByEmail = async (req, res) => {
  try {
    const ordersByEmail = await Orders.find({ email: req.session.userProfile.email });
    res.json(ordersByEmail);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


const paymentGateway = async (req, res) => {
  try {
      const token = req.session.token;
      const decodedToken = jwt.verify(token, process.env.Secret_KEY);
      const userData = await User.findById(decodedToken.userId);

      if (!userData) {
          console.log("user not found");
          return res.status(404).json({ message: 'User data not found' });
      }

      let amount = 0;
      for (const product of userData.cart) {
          try {
              const item = await Product.findOne({ itemId: product.itemId });
              amount += product.quantity * item.offeredPrice;
          } catch (error) {
              console.error(error);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
      }

      const coupon = await Coupons.findOne({ code: req.body.couponCode });
      if (coupon) {
          amount = amount - amount * (coupon.discount / 100);
      }

      amount = amount * 100;

      const options = {
          amount: amount,
          currency: 'INR',
          receipt: "piyushat115@gmail.com"
      };

      const key = Date.now() + '-' + Math.round(Math.random() * 1e9);
      req.session.handshake = key

      razorpayInstance.orders.create(options,
          async (err, order) => {
              if (!err) {
                  res.status(200).send({
                      success: true,
                      msg: 'Order Created',
                      order_id: order.id,
                      amount: amount,
                      key_id: RAZORPAY_ID_KEY,
                      product_name: req.body.name,
                      description: req.body.description,
                      handshake: key,
                      contact: userData.phone,
                      name: userData.name,
                      email: userData.email
                  });
              } else {
                  res.status(400).send({ success: false, msg: 'Something went wrong!' });
              }
          }
      );

  } catch (error) {
      console.log(error.message);
  }
};

const saveOrder = async (req, res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body.data;
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature){
        const token = req.session.token;
        const decodedToken = jwt.verify(token, process.env.Secret_KEY);
        const userData = await User.findById(decodedToken.userId)

        if (!userData) {
            console.log("user not found");
            return res.status(404).json({ message: 'User data not found' });
        }
        let amount = 0;

        for (const product of userData.cart) {
            try {
                const item = await Product.findOne({ itemId: product.itemId });
                amount += product.quantity * item.offeredPrice;
                item.stock = item.stock - product.quantity;
                await item.save();
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        }
        const coupon = await Coupons.findOne({ code: req.body.couponCode });
        if (coupon) {
            amount = amount - amount * (coupon.discount / 100);
        }

        const newOrder = new Orders({
            email: userData.email,
            products: userData.cart,
            totalPayment: amount,
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature
        });

        req.session.recentOrder = razorpay_order_id;
        
        await newOrder.save();
        userData.cart = [];
        req.session.userProfile.cart = [];
        await userData.save();
        res.status(200).json({message : "order successful"})
    } else {
        res.status(500).json({message : "order failed"})
    }
}

module.exports = {
  getOrderByEmail,
  paymentGateway,
  saveOrder
};