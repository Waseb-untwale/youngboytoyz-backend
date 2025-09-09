const express = require("express");
const router = express.Router();
const dealerController = require("../controllers/dealerController");

router.post("/register", dealerController.createDealer);
router.get("/:id", dealerController.getDealerDetails);
router.get("/", dealerController.getAllDealers);
router.put("/:id", dealerController.updateDealer);
router.delete("/:id", dealerController.deleteDealer);

module.exports = router;
