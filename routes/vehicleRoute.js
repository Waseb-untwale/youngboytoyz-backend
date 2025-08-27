const express = require("express");
const router = express.Router();

// ✅ CORRECT: Check this path. It assumes 'routes' and 'controllers' are sibling folders.
const vehicleController = require("../controllers/vehicleController");

// The error happens here if vehicleController.getVehiclesCount is not a function.
router.get("/count", vehicleController.getVehiclesCount);

module.exports = router;
