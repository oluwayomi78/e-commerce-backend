const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinaryConfig");

const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    let query = {};

    if (req.query.category && req.query.category !== "All Categories") {
        query.category = req.query.category;
    }

    if (req.query.brands) {
        const brandsArray = req.query.brands.split(",");
        query.brand = { $in: brandsArray };
    }

    if (req.query.sizes) {
        const sizesArray = req.query.sizes.split(",");
        query.size = { $in: sizesArray };
    }

    if (req.query.maxPrice) {
        query.price = { $lte: Number(req.query.maxPrice) };
    }

    let sort = {};
    if (req.query.sortBy === "price-asc") sort.price = 1;
    else if (req.query.sortBy === "price-desc") sort.price = -1;
    else sort.createdAt = -1;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        totalCount: count,
    });
});
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
});


const createProduct = asyncHandler(async (req, res) => {
    try {
        const { name, price, description, rating, numReviews, brand, category, countInStock, image } = req.body;

        if (!name || !price || !description || !brand || !category) {
            return res.status(400).json({ message: "⚠️ Please fill in all required fields" });
        }

        let imageUrl = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce-products",
            });
            imageUrl = result.secure_url;
        } else if (image && image.trim() !== "") {
            imageUrl = image;
        }

        const product = await Product.create({
            name,
            price,
            description,
            rating: rating || 0,
            numReviews: numReviews || 0,
            image: imageUrl,
            brand,
            category,
            countInStock: countInStock || 0,
            createdAt: Date.now(),
        });

        res.status(201).json({
            message: "✅ Product created successfully!",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
});

const EditProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    console.log("Request body:", req.body);

    try {
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce-products",
            });
            req.body.image = result.secure_url;
        }
        Object.assign(product, {
            name: req.body.name ?? product.name,
            price: req.body.price ?? product.price,
            description: req.body.description ?? product.description,
            rating: req.body.rating ?? product.rating,
            numReviews: req.body.numReviews ?? product.numReviews,
            image: req.body.image ?? product.image,
            brand: req.body.brand ?? product.brand,
            category: req.body.category ?? product.category,
            countInStock: req.body.countInStock ?? product.countInStock,
        });

        const updatedProduct = await product.save();
        res.json({ message: "✅ Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
});

const DeleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: "🗑️ Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

const createProductReview = async (req, res) => {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = {
            name: req.user.name, 
            rating: Number(rating),
            title: title,
            comment: comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        const newReview = product.reviews[product.reviews.length - 1];

        res.status(201).json({
            ...newReview.toObject(),
            newAverageRating: product.rating,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('reviews');

        if (product) {
            res.json(product.reviews);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = {
    getProducts,
    getProductById,
    createProduct,
    EditProduct,
    DeleteProduct,
    createProductReview,
    getProductReviews
};
