const express = require("express");
const router = express.Router();
const bikeController = require("../controllers/bikeController");
const upload = require("../middleware/upload");

router.post(
  "/",
  upload.fields([{ name: "bikeImages", maxCount: 10 }]),
  bikeController.createBike
);
router.get("/", bikeController.getAllBikes);
router.get("/:id", bikeController.getBikeById);
router.put("/:id", bikeController.updateBike);
router.delete("/:id", bikeController.deleteBike);

module.exports = router;
