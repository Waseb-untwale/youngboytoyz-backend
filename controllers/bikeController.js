const prisma = require("../utils/prisma");

// Create a new bike
exports.createBike = async (req, res) => {
  try {
    const {
      title,
      listedBy,
      registrationYear,
      kmsDriven,
      ownerCount,
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

    const bikeImage1 = files?.bikeImage1?.[0]?.path;
    const bikeImage2 = files?.bikeImage2?.[0]?.path;

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
        bikeUSP,
        fuelType,
        bikeImage1,
        bikeImage2,
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
