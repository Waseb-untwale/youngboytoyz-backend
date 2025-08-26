const prisma = require("../utils/prisma");

exports.createBike = async (req, res) => {
  try {
    const {
      title,
      listedBy,
      registrationYear,
      kmsDriven,
      ownerCount,
      badges,
      description,
      brand,
      registrationNumber,
      vipNumber,
      sellingPrice,
      cutOffPrice,
      ybtPrice,
      insurance,
      bikeUSP,
      fuelType,
    } = req.body;

    const files = req.files;

    const bikeImages = [];
    if (files && files.bikeImages) {
      if (Array.isArray(files.bikeImages)) {
        bikeImages.push(...files.bikeImages.map((file) => file.path));
      } else {
        bikeImages.push(files.bikeImages.path);
      }
    }

    let processedBadges = [];
    if (badges) {
      if (Array.isArray(badges)) {
        processedBadges = badges;
      } else {
        processedBadges = [badges];
      }
    }

    const bike = await prisma.bike.create({
      data: {
        title,
        listedBy,
        registrationYear: parseInt(registrationYear),
        kmsDriven: parseInt(kmsDriven),
        ownerCount: parseInt(ownerCount),
        registrationNumber,
        vipNumber: vipNumber === "true" ? true : false,
        sellingPrice: parseFloat(sellingPrice),
        cutOffPrice: parseFloat(cutOffPrice),
        ybtPrice: parseFloat(ybtPrice),
        insurance,
        badges: processedBadges,
        description,
        brand,
        bikeUSP,
        fuelType,
        bikeImages,
      },
    });

    res.status(201).json(bike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bikes
exports.getAllBikes = async (req, res) => {
  try {
    const bikes = await prisma.bike.findMany();
    res.json(bikes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single bike
exports.getBikeById = async (req, res) => {
  try {
    const bike = await prisma.bike.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!bike) return res.status(404).json({ error: "Bike not found" });
    res.json(bike);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a bike
exports.updateBike = async (req, res) => {
  try {
    const updatedBike = await prisma.bike.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updatedBike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a bike
exports.deleteBike = async (req, res) => {
  try {
    await prisma.bike.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Bike deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
