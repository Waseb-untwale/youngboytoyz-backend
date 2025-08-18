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

    const carImage1 = files?.carImage1?.[0]?.path;
    const carImage2 = files?.carImage2?.[0]?.path;

    const car = await prisma.car.create({
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
        carUSP,
        fuelType,
        carImage1,
        carImage2,
      },
    });

    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
