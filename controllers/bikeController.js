const prisma = require("../utils/prisma");

exports.createBike = async (req, res) => {
  try {
    const {
      title,
      dealerId, // Added dealerId from the schema
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
      status, // Added status from the schema
    } = req.body;

    const files = req.files;

    // Handle multiple bike images and a single thumbnail
    const bikeImages = [];
    if (files && files.bikeImages) {
      if (Array.isArray(files.bikeImages)) {
        bikeImages.push(...files.bikeImages.map((file) => file.path));
      } else {
        bikeImages.push(files.bikeImages.path);
      }
    }

    let thumbnail = null;
    if (files && files.thumbnail && files.thumbnail[0]) {
      thumbnail = files.thumbnail[0].path;
    }

    // Process badges, ensuring it's an array of strings
    const processedBadges = Array.isArray(badges)
      ? badges
      : badges
      ? [badges]
      : [];

    const bike = await prisma.bike.create({
      data: {
        title,
        dealerId: parseInt(dealerId), // Parse dealerId to an integer
        registrationYear: parseInt(registrationYear),
        kmsDriven: parseInt(kmsDriven),
        ownerCount: parseInt(ownerCount),
        registrationNumber,
        vipNumber: vipNumber === "true" || vipNumber === true, // Handle boolean from form-data or JSON
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
        thumbnail:
          carImages[0] ||
          "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available", // Added thumbnail field
        status, // Added status field
      },
    });

    res.status(201).json(bike);
  } catch (error) {
    // Improved error handling to provide more specific messages
    console.error("Error creating bike:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all bikes
exports.getAllBikes = async (req, res) => {
  try {
    const {
      limit = 10,
      cursor,
      searchTerm,
      brands,
      sortBy = "newest",
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      fuelType,
      status, // Added status as a filter
    } = req.query;

    const take = parseInt(limit);
    const where = {};

    // Filtering logic
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
    if (brands) {
      where.brand = { in: brands.split(",") };
    }
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }
    if (minYear || maxYear) {
      where.registrationYear = {};
      if (minYear) where.registrationYear.gte = parseInt(minYear);
      if (maxYear) where.registrationYear.lte = parseInt(maxYear);
    }
    if (fuelType) {
      where.fuelType = fuelType;
    }
    if (status) {
      where.status = status;
    }

    // Sorting logic
    let orderBy;
    switch (sortBy) {
      case "price_asc":
        orderBy = { sellingPrice: "asc" };
        break;
      case "price_desc":
        orderBy = { sellingPrice: "desc" };
        break;
      case "year_asc":
        orderBy = { registrationYear: "asc" };
        break;
      case "year_desc":
        orderBy = { registrationYear: "desc" };
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
      take,
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        brand: true,
        badges: true,
        thumbnail: true,
        sellingPrice: true, // Added sellingPrice to the select for sorting/filtering
        createdAt: true,
        status: true, // Added status
      },
    };

    if (cursor) {
      // Corrected cursor logic for better pagination
      prismaQueryOptions.skip = 1;
      const parsedCursor = JSON.parse(cursor);
      prismaQueryOptions.cursor = {
        id: parsedCursor.id,
      };
    }

    const bikes = await prisma.bike.findMany(prismaQueryOptions);

    let nextCursor = null;
    if (bikes.length === take) {
      const lastBike = bikes[bikes.length - 1];
      nextCursor = JSON.stringify({ id: lastBike.id });
    }

    res.json({
      data: bikes,
      nextCursor,
    });
  } catch (error) {
    console.error("Error getting all bikes:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBikeById = async (req, res) => {
  try {
    const bike = await prisma.bike.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        dealer: true,
      },
    });
    if (!bike) return res.status(404).json({ error: "Bike not found" });
    res.json(bike);
  } catch (error) {
    console.error("Error getting bike by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBike = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      badges,
      vipNumber,
      sellingPrice,
      cutOffPrice,
      ybtPrice,
      ...otherData
    } = req.body;
    const files = req.files;

    const dataToUpdate = { ...otherData };

    // Handle files for update (optional)
    if (files && files.bikeImages) {
      dataToUpdate.bikeImages = Array.isArray(files.bikeImages)
        ? files.bikeImages.map((file) => file.path)
        : [files.bikeImages.path];
    }
    if (files && files.thumbnail && files.thumbnail[0]) {
      dataToUpdate.thumbnail = files.thumbnail[0].path;
    }

    // Process badges for update
    if (badges) {
      dataToUpdate.badges = Array.isArray(badges) ? badges : [badges];
    }

    // Convert string inputs from form-data to their correct types
    if (vipNumber !== undefined) {
      dataToUpdate.vipNumber = vipNumber === "true" || vipNumber === true;
    }
    if (sellingPrice) {
      dataToUpdate.sellingPrice = parseFloat(sellingPrice);
    }
    if (cutOffPrice) {
      dataToUpdate.cutOffPrice = parseFloat(cutOffPrice);
    }
    if (ybtPrice) {
      dataToUpdate.ybtPrice = parseFloat(ybtPrice);
    }

    const updatedBike = await prisma.bike.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.json(updatedBike);
  } catch (error) {
    console.error("Error updating bike:", error);
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
    console.error("Error deleting bike:", error);
    res.status(500).json({ error: error.message });
  }
};
