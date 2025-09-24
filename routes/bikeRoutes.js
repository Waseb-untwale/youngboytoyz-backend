const express = require("express");
const router = express.Router();
const bikeController = require("../controllers/bikeController");
const upload = require("../middleware/upload");
const { validateCreateBike } = require("../validators/bikeValidator");

router.post(
  "/",
  upload.fields([{ name: "bikeImages", maxCount: 10 }]),
  validateCreateBike,
  bikeController.createBike
);
router.get("/", bikeController.getAllBikes);
router.get("/count", bikeController.getTotalBikes);
router.get("/:id", bikeController.getBikeById);
router.put("/:id", bikeController.updateBike);
router.delete("/:id", bikeController.deleteBike);

module.exports = router;
