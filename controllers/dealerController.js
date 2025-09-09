const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createDealer = async (req, res) => {
  try {
    const { name, email, phone, address, city, state } = req.body;
    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Name and email are required fields." });
    }

    const newDealer = await prisma.dealer.create({
      data: { name, email, phone, address, city, state },
    });

    res.status(201).json(newDealer);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `A dealer with that ${error.meta.target.join(
          ", "
        )} already exists.`,
      });
    }
    console.error("Failed to create dealer:", error);
    res.status(500).json({ message: "Unable to create dealer." });
  }
};

exports.getAllDealers = async (req, res) => {
  try {
    const dealers = await prisma.dealer.findMany();
    res.status(200).json(dealers);
  } catch (error) {
    console.error("Failed to fetch dealers:", error);
    res.status(500).json({ message: "Unable to fetch dealers." });
  }
};

exports.getDealerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const dealer = await prisma.dealer.findUnique({
      where: { id: parseInt(id) },
      // --- Enhanced with 'include' ---
      include: {
        cars: true, // Include all cars listed by this dealer
        bikes: true, // Include all bikes listed by this dealer
      },
    });

    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }
    res.status(200).json(dealer);
  } catch (error) {
    console.error("Failed to fetch dealer details:", error);
    res.status(500).json({ message: "Unable to fetch dealer details." });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;

    const updatedDealer = await prisma.dealer.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json(updatedDealer);
  } catch (error) {
    if (error.code === "P2025") {
      // Handles record not found
      return res.status(404).json({ message: "Dealer not found." });
    }
    console.error("Failed to update dealer:", error);
    res.status(500).json({ message: "Unable to update dealer." });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.dealer.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      // Handles record not found
      return res.status(404).json({ message: "Dealer not found." });
    }
    console.error("Failed to delete dealer:", error);
    res.status(500).json({ message: "Unable to delete dealer." });
  }
};
