const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.get("/count", vehicleController.getVehiclesCount);
router.get("/vehicles/search", vehicleController.searchVehicles);
module.exports = router;
