const Orders = require('../schemas/order_schema');

const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Orders.find();
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getOrderByDate = async (req, res) => {
  try {
    const ordersByDate = await Orders.find({ Date: new Date(req.params.date) });
    res.json(ordersByDate);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getOrderByEmail = async (req, res) => {
  try {
    const ordersByEmail = await Orders.find({ email: req.params.email });
    res.json(ordersByEmail);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const placeNewOrder = async (req, res) => {
  try {
    const newOrder = new Orders(req.body);
    const savedOrder = await newOrder.save();
    res.json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Orders.findByIdAndUpdate(req.params.orderId, req.body, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllOrders,
  getOrderByDate,
  getOrderByEmail,
  placeNewOrder,
  updateOrderStatus
};