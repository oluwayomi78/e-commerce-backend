const asyncHandler = require("express-async-handler")
const Order = require("../models/orderModel")

const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400).json({ message: "No order items" })
    }

    const order = new order({
        user: req.user._id,
        orderItems: orderItems.map(item => ({
            ...item,
            product: item._id,
            _id: undefined
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    })

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
});


const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});


const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );

    if (!order) {
        res.status(404).json("Order not found");
    }


    if (req.user.isAdmin || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
    } else {
        res.status(403).json({ message: "Not authorized to view this order" });
    }
});


const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "id name");
    res.json(orders);
});

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrderById,
    getAllOrders,
};