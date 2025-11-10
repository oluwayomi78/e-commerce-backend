const User = require("../Models/userModel");
const Product = require("../Models/productModel");

const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cart.product");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existItem = user.cart.find(item => item.product.toString() === productId);

        if (existItem) {
            existItem.quantity += quantity;
        } else {
            user.cart.push({ product: productId, quantity: quantity });
        }

        await user.save();
        
        const updatedUser = await User.findById(req.user._id).populate('cart.product');
        res.status(201).json(updatedUser.cart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);

        await user.save();
        
        const updatedUser = await User.findById(req.user._id).populate('cart.product');
        res.json(updatedUser.cart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
};