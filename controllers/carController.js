const prisma = require("../utils/prisma");

// Create a new car
exports.createCar = async (req, res) => {
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
      carUSP,
      fuelType,
    } = req.body;

    const files = req.files;

    const carImages = [];
    if (files && files.carImages) {
      // If multiple files uploaded
      if (Array.isArray(files.carImages)) {
        carImages.push(...files.carImages.map((file) => file.path));
      } else {
        // If single file uploaded
        carImages.push(files.carImages.path);
      }
    }

    // Handle badges from form-data
    let processedBadges = [];
    if (badges) {
      if (Array.isArray(badges)) {
        processedBadges = badges;
      } else {
        processedBadges = [badges]; // Single badge as string
      }
    }

    const car = await prisma.car.create({
      data: {
        title,
        listedBy,
        registrationYear: parseInt(registrationYear),
        kmsDriven: parseInt(kmsDriven),
        ownerCount: parseInt(ownerCount),
        registrationNumber,
        vipNumber: vipNumber === "true",
        sellingPrice: parseFloat(sellingPrice),
        cutOffPrice: parseFloat(cutOffPrice),
        ybtPrice: parseFloat(ybtPrice),
        insurance,
        badges: processedBadges,
        description,
        brand,
        carUSP,
        fuelType,
        carImages,
      },
    });

    res.status(201).json(car);
  } catch (error) {
    console.error("💥 FAILED TO CREATE BIKE:", error);

    res.status(500).json({
      message: "Failed to create bike.",
      error: error.message,
    });
  }
};
// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const { fields } = req.query;

    let selectFields = {};

    if (fields) {
      const fieldArray = fields.split(",").map((field) => field.trim());
      selectFields = fieldArray.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
    }

    const cars = await prisma.car.findMany({
      select: Object.keys(selectFields).length > 0 ? selectFields : undefined,
    });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTotalCars = async (req, res) => {
  try {
    // Use the count() method on your car model for efficiency
    const totalCars = await prisma.car.count();

    // Send a success response with the total count
    res.status(200).json({ total: totalCars });
  } catch (error) {
    console.error("Failed to get total cars:", error); // Good practice to log the error
    // Note: Corrected 'err' to 'error' to match the catch parameter
    res.status(500).json({ error: error.message });
  }
};

// Get a single car by ID
exports.getCarById = async (req, res) => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a car
exports.updateCar = async (req, res) => {
  try {
    const updatedCar = await prisma.car.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a car
exports.deleteCar = async (req, res) => {
  try {
    await prisma.car.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
