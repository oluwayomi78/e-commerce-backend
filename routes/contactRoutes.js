const express = require("express");
const router = express.Router();
const { submitContactForm, getContactForm } = require("../Controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", submitContactForm);
router.get("/", protect, admin, getContactForm);

module.exports = router;