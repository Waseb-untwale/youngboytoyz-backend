const express = require("express");
const router = express.Router();
const {
  getUsers,
  totalUsers,
  updateUserDetails,
  updatePassword,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getUsers);
router.get("/totalusers", protect, totalUsers);
router.put("/profile", protect, updateUserDetails);
router.put("/update-password", protect, updatePassword);

module.exports = router;
