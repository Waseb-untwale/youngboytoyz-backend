const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const designerController = require("../controllers/designerController");

router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 10 }]),
  designerController.createDesigner
);

router.get("/", designerController.getAllDesigners);
router.get("/:id", designerController.getDesignerById);
router.get("/slug/:slug", designerController.getDesignerBySlug);
router.delete("/:id", designerController.deleteDesigner);

module.exports = router;
