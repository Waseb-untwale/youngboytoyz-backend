const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  totalUsers,
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/", createUser);
router.get("/totalusers", totalUsers);

module.exports = router;
