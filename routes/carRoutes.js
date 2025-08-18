const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const upload= require('../middleware/upload')

router.post("/", upload.fields([{ name: "carImage1" }, { name: "carImage2" }]), carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

module.exports = router;
