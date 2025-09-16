const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const upload = require("../middleware/upload");

const { protect } = require("../middleware/authMiddleware");

router.post(
  "/",
  upload.fields([{ name: "carImages", maxCount: 10 }]),
  carController.createCar
);
router.get("/", carController.getAllCars);
router.get("/count", carController.getTotalCars);
router.get("/:id", carController.getCarById);
router.put(
  "/:id",
  upload.fields([{ name: "carImages", maxCount: 10 }]),
  carController.updateCar
);
router.post("/:carId/book", protect, carController.bookCar);
router.post("/:carId/guest-book", carController.createGuestBooking);
router.delete("/:id", carController.deleteCar);

module.exports = router;
