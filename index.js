const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const productRoutes = require("./routes/productRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.disable("x-powered-by");

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://luxemart-peach.vercel.app",
        "https://luxemart.preciousenoch459.workers.dev",
        "https://luxemart.com",
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const uri = process.env.URI;
mongoose.set("strictQuery", false);
mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PORT = process.env.PORT || 5300;

app.get("/", (req, res) => {
    res.send("🚀 LuxeMart API is running...");
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
