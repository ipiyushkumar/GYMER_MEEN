const Users = require('../schemas/user_schema');
const Orders = require('../schemas/order_schema');
const Coupons = require('../schemas/coupons_schema');

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
const getCouponsByCode = async (req, res) => {
    try {
        const coupon = await Coupons.findOne({ code: req.params.code });
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
const getAllCoupons = async (req, res) => {
    try {
        const allCoupons = await Coupons.find();
        res.status(200).json(allCoupons);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
  }

const addNewCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupons(req.body);
        const savedCoupon = await newCoupon.save();
        res.status(201).json({message : "coupon successfully created"});
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
  }

const deleteCouponByCode = async (req, res) => {
    try {
        const deletedCoupon = await Coupons.findOneAndDelete({ code: req.params.code });
        if (!deletedCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }
        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
  }

module.exports = {
    getAllUsers,
    getAllOrders,
    getAllCoupons,
    getCouponsByCode,
    addNewCoupon,
    deleteCouponByCode
};