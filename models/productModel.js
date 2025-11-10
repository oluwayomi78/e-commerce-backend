const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true 
    },
    title: { 
        type: String 
    },
    comment: { 
        type: String, 
        required: true 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, {
    timestamps: true,
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand:{
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    },
    photoUrl: {
        type: String,
        required: false,
        default: ''
    },
    reviews: [reviewSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);