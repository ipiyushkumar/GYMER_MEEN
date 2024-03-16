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

const nodemailer = require("nodemailer");

const orderMail = (req, res, orderDetails) => {
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
    subject: `New Order Placed - WhiteWolf India 🟢`,
    html: `
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
      <img src="https://i.ibb.co/0GQgmn7/whitewolflog.png" alt="Whitewolf India Logo" style="width: 50px; height: auto;">
      <h2 style="color: #333; margin-top: 20px;">WhiteWolf India</h2>
    </div>
    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 20px;">
      <p style="font-size: 16px; color: #333;">Dear Admin,</p>
      <p style="font-size: 18px; color: #333;">A new order has been placed on WhiteWolf India:</p>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background-color: #f2f2f2;">
          <th  style="padding: 10px; text-align: left;">Image</th>
          <th style="padding: 10px; text-align: left;">Name</th>
          <th style="padding: 10px; text-align: left;">Price</th>
        </tr>
        ${orderDetails
          .map(
            (product) => `
          <tr>
            <td style="padding: 10px;"><img src="${product.image}" alt="Product Image" style="max-width: 100px; max-height: 100px;"></td>
            <td style="padding: 10px;">${product.name}</td>
            <td style="padding: 10px;">${product.price}</td>
          </tr>
        `
          )
          .join("")}
      </table>
      <p style="font-size: 16px; color: #333;">Please proceed with the order processing.</p>
      <p style="font-size: 16px; color: #333;">Thank You.</p>
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
const UserSessionTrack = require("../schemas/user_session_manager");

const saveOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body.data;
  if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const method = "prepaid";
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

          let orderDetails = [];

          for (const product of userData.cart) {
            try {
              const item = await Product.findOne({ itemId: product.itemId });
              amount += product.quantity * item.offeredPrice;
              item.stock = item.stock - product.quantity;

              orderDetails.push({
                name: item.name,
                image: "https://www.whitewolfindia.com" + item.imageLink[0],
                price: item.offeredPrice,
              });

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

          // Update the user data
          userData.name = name || userData.name;
          userData.phone = phone || userData.phone;
          userData.pincode = pincode || userData.pincode;
          userData.locality = locality || userData.locality;
          userData.landmark = landmark || userData.landmark;
          userData.city = city || userData.city;
          userData.address = address || userData.address;
          userData.cart = userData.cart;

          UserSessionTrack.findOne({ sessionId: req.sessionID })
            .then((userSession) => {
              if (userSession) {
                userSession.visited += 1;
                userSession.sessionConverted += 1;
                return userSession.save();
              } else {
                const newUserSession = new UserSessionTrack({
                  sessionId: req.sessionID,
                  sessionLandingUrl: req.originalUrl,
                  sessionConverted: 1,
                });
                return newUserSession.save(); // Save new session
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          userData.cart = [];
          req.session.userProfile.cart = [];
          await userData.save();
          orderMail(req, res, orderDetails);
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
    const method = "COD";

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
      req.session.couponCode = req.body.couponCode;
      req.session.flow = true;
      return res.status(404).json({ message: "User data not found" });
    } else {
      userData.cart = req.session.userProfile.cart;
      userData.save();
    }

    let amount = 0;
    let orderDetails = [];

    for (const product of userData.cart) {
      try {
        const item = await Product.findOne({ itemId: product.itemId });
        amount += product.quantity * item.offeredPrice;
        item.stock = item.stock - product.quantity;

        orderDetails.push({
          name: item.name,
          image: "https://www.whitewolfindia.com" + item.imageLink[0],
          price: item.offeredPrice,
        });

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
      products: req.session.userProfile.cart,
      phone: userData.phone,
      name: req.session.userProfile.name,
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

    // Update the user data
    userData.name = name || userData.name;
    userData.phone = phone || userData.phone;
    userData.pincode = pincode || userData.pincode;
    userData.locality = locality || userData.locality;
    userData.landmark = landmark || userData.landmark;
    userData.city = city || userData.city;
    userData.address = address || userData.address;
    userData.cart = userData.cart;

    UserSessionTrack.findOne({ sessionId: req.sessionID })
      .then((userSession) => {
        if (userSession) {
          userSession.visited += 1;
          userSession.sessionConverted += 1;
          return userSession.save();
        } else {
          const newUserSession = new UserSessionTrack({
            sessionId: req.sessionID,
            sessionLandingUrl: req.originalUrl,
            sessionConverted: 1,
          });
          return newUserSession.save(); // Save new session
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    userData.cart = [];

    req.session.userProfile.cart = [];
    await userData.save();
    orderMail(req, res, orderDetails);
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
