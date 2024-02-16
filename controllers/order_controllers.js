const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schemas/user_schema");
const Product = require("../schemas/product_schema");
const Orders = require("../schemas/order_schema");
const Coupons = require("../schemas/coupons_schema");

// email
const getOrderByEmail = async (req, res) => {
  try {
    const ordersByEmail = await Orders.find({ email: req.session.email });
    res.json(ordersByEmail);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Razorpay = require("razorpay");
const user = require("../schemas/user_schema");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const paymentGateway = async (req, res) => {
  try {
    const { name, phone, pincode, address, city, locality, landmark } =
      req.body;
    req.session.userProfile.name = name;
    req.session.userProfile.phone = phone;
    req.session.userProfile.pincode = pincode;
    req.session.userProfile.address = address;
    req.session.userProfile.city = city;
    req.session.userProfile.locality = locality;
    req.session.userProfile.landmark = landmark;

    const userData = await User.findOne({ email: req.session.email });

    if (!userData) {
      console.log("user not found");
      req.session.couponCode = req.body.couponCode;
      req.session.flow = true;
      return res.status(404).json({ message: "User data not found" });
    } else {
      userData.cart = req.session.userProfile.cart;
      userData.save();
    }

    let amount = 0;
    for (const product of userData.cart) {
      try {
        const item = await Product.findOne({ itemId: product.itemId });
        amount += product.quantity * item.offeredPrice;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }

    const coupon = await Coupons.findOne({ code: req.body.couponCode });
    if (coupon) {
      amount = amount - amount * (coupon.discount / 100);
    }
    amount = Math.floor(amount);

    amount = amount * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "piyushat115@gmail.com",
    };

    razorpayInstance.orders.create(options, async (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          product_name: req.body.name,
          description: req.body.description,
          contact: userData.phone,
          name: userData.name,
          email: userData.email,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const payment = require("../schemas/payment_signatures");

const saveOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body.data;
  if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const method = "Online payment";
    razorpayInstance.payments
      .fetch(razorpay_payment_id)
      .then(async (response) => {
        if (response.order_id == razorpay_order_id) {
          const userData = await User.findOne({ email: req.session.email });

          if (!userData) {
            console.log("user not found");
            return res.status(404).json({ message: "User data not found" });
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
              return res.status(500).json({ error: "Internal Server Error" });
            }
          }
          const coupon = await Coupons.findOne({ code: req.body.couponCode });
          if (coupon) {
            amount = amount - amount * (coupon.discount / 100);
          }
          amount = Math.floor(amount);

          const newOrder = new Orders({
            email: userData.email,
            products: userData.cart,
            phone: userData.phone,
            name: userData.name,
            totalPayment: amount,
            razorpay_order_id,
            address: req.session.userProfile.address,
            locality: req.session.userProfile.locality,
            landmark: req.session.userProfile.landmark,
            city: req.session.userProfile.city,
            pincode: req.session.userProfile.pincode,
            deliveryAddress: `address: ${req.session.userProfile.address}, locality ${req.session.userProfile.locality}, landmark ${req.session.userProfile.landmark}, city, ${req.session.userProfile.city} (Pincode : ${req.session.userProfile.pincode})`,
            deliveryMethod: method,
          });

          const payment_data = new payment({
            email: userData.email,
            phone: userData.phone,
            name: userData.name,
            totalPayment: amount,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            deliveryAddress: `address: ${req.session.userProfile.address}, locality ${req.session.userProfile.locality}, landmark ${req.session.userProfile.landmark}, city, ${req.session.userProfile.city} (Pincode : ${req.session.userProfile.pincode})`,
          });

          req.session.recentOrder = razorpay_order_id;

          await newOrder.save();
          await payment_data.save();

          userData.cart = [];
          req.session.userProfile.cart = [];
          await userData.save();
          res.status(200).json({ message: "order successful" });
        } else {
          res.status(400).json({ message: "orderId mismatch" });
        }
      })
      .catch((err) =>
        res.status(400).send({ message: "the paymentId does not exist" })
      );
  } else {
    const userData = await User.findOne({ email: req.session.email });
    const method = "cash on delivery";

    const { name, phone, pincode, address, city, locality, landmark } =
      req.body.data;

    req.session.userProfile.name = name;
    req.session.userProfile.phone = phone;
    req.session.userProfile.pincode = pincode;
    req.session.userProfile.address = address;
    req.session.userProfile.city = city;
    req.session.userProfile.locality = locality;
    req.session.userProfile.landmark = landmark;

    if (!userData) {
      console.log("user not found");
      return res.status(404).json({ message: "User data not found" });
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
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    const coupon = await Coupons.findOne({ code: req.body.couponCode });
    if (coupon) {
      amount = amount - amount * (coupon.discount / 100);
    }
    amount = Math.floor(amount);

    const newOrder = new Orders({
      email: userData.email,
      products: userData.cart,
      phone: userData.phone,
      name: userData.name,
      totalPayment: amount,
      razorpay_order_id: "",
      address: req.session.userProfile.address,
      locality: req.session.userProfile.locality,
      landmark: req.session.userProfile.landmark,
      city: req.session.userProfile.city,
      pincode: req.session.userProfile.pincode,
      deliveryAddress: `address: ${req.session.userProfile.address}, locality ${req.session.userProfile.locality}, landmark ${req.session.userProfile.landmark}, city, ${req.session.userProfile.city} (Pincode : ${req.session.userProfile.pincode})`,
      deliveryMethod: method,
    });

    newOrder.razorpay_order_id = "order_" + newOrder._id;
    await newOrder.save();

    userData.cart = [];
    req.session.userProfile.cart = [];
    await userData.save();
    res.status(200).json({ message: "order successful" });
  }
};

// const testAPI = (req,res) => {
//     const {id } = req.params
//     razorpayInstance.payments.fetch(id)
//     .then(response => {
//         razorpayInstance.orders.fetch(response.order_id)
//         .then(response => res.status(200).send({res :  response}))
//         .catch(err => res.status(200).send({err}))
//     })
//     .catch(err => res.status(200).send({err}))
// }

module.exports = {
  getOrderByEmail,
  paymentGateway,
  saveOrder,
};
