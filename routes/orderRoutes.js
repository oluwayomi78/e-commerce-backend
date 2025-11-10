const express = require("express")
const router = express.Router();
const { addOrderItems, getAllOrders, getMyOrders, getOrderById} = require("../Controllers/orderController")

const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, addOrderItems)
router.get("/", protect, admin, getAllOrders)


router.get("/myOrders", protect, getMyOrders)
router.get("/:id", protect, getOrderById)

module.exports = router;