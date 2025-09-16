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

router.get("/", eventController.getallEvents);

router.get(
  "/totaleventscount",
  protect,
  admin,
  eventController.getTotalEventsCount
);

router.get("/:id", eventController.getEventbyId);
module.exports = router;
