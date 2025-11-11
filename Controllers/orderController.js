const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const axios = require("axios");

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
        res.status(400).json({ message: "No order items" });
        return;
    }

    const order = new Order({
        user: req.user._id,
        orderItems: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
    let data;
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${req.body.id}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        data = response.data.data;
    } catch (error) {
        console.error("Paystack verification failed:", error);
        res.status(500).json({ message: "Payment verification failed" });
        return;
    }
    
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    
    const isSuccess = data.status === "success";
    const amountMatches = data.amount === Math.round(order.totalPrice * 100);
    
    if (isSuccess && amountMatches && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: data.status,
            update_time: data.transaction_date,
            email_address: data.customer.email,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        if (order.isPaid) {
            res.status(400).json({ message: "Order is already paid" });
        } else if (!isSuccess) {
            res.status(400).json({ message: "Payment was not successful" });
        } else if (!amountMatches) {
            res.status(400).json({ message: "Payment amount does not match order total" });
        } else {
            res.status(400).json({ message: "Payment verification failed" });
        }
    }
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
        return;
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
    updateOrderToPaid,
};