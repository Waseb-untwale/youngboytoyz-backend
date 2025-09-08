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
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : undefined;

    const { searchTerm, brands, sortBy = "newest" } = req.query;

    const where = {};

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (brands) {
      const brandList = brands.split(",");
      if (brandList.length > 0) {
        where.brand = { in: brandList };
      }
    }

    let orderBy;
    switch (sortBy) {
      case "name_asc":
        orderBy = { title: "asc" };
        break;
      case "name_desc":
        orderBy = { title: "desc" };
        break;
      case "oldest":
        orderBy = [{ createdAt: "asc" }, { id: "asc" }];
        break;
      case "newest":
      default:
        orderBy = [{ createdAt: "desc" }, { id: "desc" }];
        break;
    }

    const prismaQueryOptions = {
      take: limit,
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        brand: true,
        badges: true,
        thumbnail: true,
        createdAt: true,
      },
    };

    if (cursor && (sortBy === "newest" || sortBy === "oldest")) {
      prismaQueryOptions.cursor = {
        createdAt_id: {
          createdAt: new Date(cursor.createdAt),
          id: cursor.id,
        },
      };
      prismaQueryOptions.skip = 1;
    }

    const bikes = await prisma.bike.findMany(prismaQueryOptions);

    let nextCursor = null;
    if (bikes.length === limit) {
      const lastBike = bikes[bikes.length - 1];
      nextCursor = JSON.stringify({
        createdAt: lastBike.createdAt,
        id: lastBike.id,
      });
    }

    res.json({
      data: bikes,
      nextCursor,
    });
  } catch (error) {
    console.error("Error in getAllCars:", error);
    res.status(500).json({ error: error.message });
  }
};

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
