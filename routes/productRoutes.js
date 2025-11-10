const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { getProducts, getProductById, createProduct, EditProduct, DeleteProduct, createProductReview,getProductReviews } = require("../Controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post('/:id/reviews', protect, createProductReview);
router.get('/:id/reviews', getProductReviews);

router.post("/", protect, admin, upload.single("image"), createProduct);
router.put("/:id", protect, admin, upload.single("image"), EditProduct);
router.delete("/:id", protect, admin, DeleteProduct);

module.exports = router;