const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const upload = require("../middleware/upload");
const { protect, admin } = require("../middleware/authMiddleware");

router.post(
  "/",
  upload.fields([{ name: "images", maxCount: 10 }]),
  eventController.createEvent
);

router.get("/", protect, admin, eventController.getallEvents);
router.get(
  "/totaleventscount",
  protect,
  admin,
  eventController.getTotalEventsCount
);
module.exports = router;
