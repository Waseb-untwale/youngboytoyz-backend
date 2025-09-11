const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const upload = require("../middleware/upload");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");

const carValidationRules = [
  body("title").trim().notEmpty().withMessage("Car title is required."),
  body("listedBy").trim().notEmpty().withMessage("Listed by is required."),
  body("registrationYear")
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage("Please enter a valid registration year."),
  body("kmsDriven")
    .isInt({ min: 0 })
    .withMessage("KMS driven must be a number."),
  body("ownerCount")
    .isInt({ min: 1 })
    .withMessage("Owner count must be at least 1."),
  body("registrationNumber")
    .trim()
    .notEmpty()
    .withMessage("Registration number is required."),
  body("sellingPrice")
    .isFloat({ gt: 0 })
    .withMessage("Selling price must be a positive number."),
  body("fuelType").trim().notEmpty().withMessage("Fuel type is required."),
  body("description").trim(),
  body("brand").trim(),
];

router.post(
  "/",
  upload.fields([{ name: "carImages", maxCount: 10 }]),
  carController.createCar
);
router.get("/", carController.getAllCars);
router.get("/count", carController.getTotalCars);
router.get("/:id", carController.getCarById);
router.put("/:id", carController.updateCar);
router.post("/:carId/book", protect, carController.bookCar);
router.post("/:carId/guest-book", carController.createGuestBooking);
router.delete("/:id", carController.deleteCar);

module.exports = router;
