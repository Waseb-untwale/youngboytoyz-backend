const prisma = require("../utils/prisma");

exports.getVehiclesCount = async (req, res) => {
  try {
    const carCount = await prisma.car.count();
    const bikeCount = await prisma.bike.count();

    res.status(200).json({
      totalVehicles: carCount + bikeCount,
      cars: carCount,
      bike: bikeCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
