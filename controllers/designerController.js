const prisma = require("../utils/prisma");

exports.createDesigner = async (req, res) => {
  const { name, title, description, image, stats, slug } = req.body;

  if (!name || !title || !description) {
    return res
      .status(400)
      .json({ message: "Name, title, and description are required." });
  }

  try {
    const designer = await prisma.designer.create({
      data: {
        name,
        title,
        description,
        slug,
        image: image || "https://placehold.co/800x600?text=No+Image",
        stats: stats || {},
      },
    });
    res.status(201).json(designer);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "A designer with this name already exists." });
    }
    console.error("💥 FAILED TO CREATE DESIGNER:", error);
    res
      .status(500)
      .json({ message: "Failed to create designer", error: error.message });
  }
};

exports.getAllDesigners = async (req, res) => {
  try {
    const designers = await prisma.designer.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json(designers);
  } catch (error) {
    console.error("💥 FAILED TO GET DESIGNERS:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch designers", error: error.message });
  }
};

exports.getDesignerBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const designer = await prisma.designer.findUnique({
      where: { slug },
    });
    if (!designer) {
      return res.status(404).json({ message: "Designer not found." });
    }
    res.status(200).json(designer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch designer", error: error.message });
  }
};

exports.getDesignerById = async (req, res) => {
  const { id } = req.params;
  try {
    const designer = await prisma.designer.findUnique({
      where: { id: parseInt(id) },
    });
    if (!designer) {
      return res.status(404).json({ message: "Designer not found." });
    }
    res.status(200).json(designer);
  } catch (error) {
    console.error(`💥 FAILED TO GET DESIGNER ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch designer", error: error.message });
  }
};

exports.deleteDesigner = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Designer ID provided." });
  }
  try {
    const deleteDesigner = await prisma.designer.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      message: "Designer deleted successfully.",
      deletedId: deleteDesigner.id,
    });
  } catch (error) {
    console.error("Error in DeleteDesigner:", error);
    res.status(500).json({ error: "Failed to delete Designer." });
  }
};
