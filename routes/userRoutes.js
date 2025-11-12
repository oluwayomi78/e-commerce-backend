const express = require("express");
const router = express.Router();
const { getUsers,registerUser, loginUser, googleLogin, updateUser,getUserById } = require("../Controllers/userController.js");
const { getCart, addToCart, removeFromCart } = require("../Controllers/cartController.js");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/",protect, admin, getUsers);
router.put("/:id", protect, updateUser);
router.get("/:id", protect, getUserById);
router.post("/", registerUser);
router.post('/google', googleLogin);
router.post("/login", loginUser);
router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.delete('/cart/:productId', protect, removeFromCart);
// router.get("/me", protect, userController.getUserProfile);

module.exports = router;