const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const upload = require("../middleware/upload");
router.post(
  "/",
  upload.fields([{ name: "images", maxCount: 10 }]),
  eventController.createEvent
);

router.get("/", eventController.getallEvents);
router.get("/totaleventscount", eventController.getTotalEventsCount);
module.exports = router;
