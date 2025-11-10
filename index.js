const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require("path");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const productRoutes = require("./routes/productRoutes.js")
const userRoutes = require("./routes/userRoutes.js")
const orderRoutes = require("./routes/orderRoutes.js")
const contactRoutes = require("./routes/contactRoutes.js")
const chatRoutes = require("./routes/chatRoutes.js")
const { GoogleGenerativeAI } = require("@google/generative-ai");

const corsOptions = {
    origin: ['http://localhost:5174', 'https://luxemart-u343.vercel.app'], // This is your frontend URL
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(notFound);
app.use(errorHandler);


const port = process.env.PORT || 5300;
const uri = process.env.URI;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log(err);
    })

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`the server is running on port ${port}`)
})