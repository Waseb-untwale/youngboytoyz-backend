const bikeService = require("../services/bikeService");

exports.createBike = async (req, res) => {
  try {
    if (
      !req.files ||
      !req.files.bikeImages ||
      req.files.bikeImages.length === 0
    ) {
      return res.status(400).json({
        errors: [{ message: "At least one bike image is required." }],
      });
    }

    const newBike = await bikeService.createBike(req.body, req.files);
    res.status(201).json(newBike);
  } catch (error) {
    console.error("💥 FAILED TO CREATE BIKE:", error);
    res.status(500).json({
      message: "Failed to create bike.",
      error: error.message,
    });
  }
};

exports.getAllBikes = async (req, res) => {
  try {
    const responseData = await bikeService.getAllBikes(req.query);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error in getAllBikes controller:", error);
    res.status(500).json({ error: "Failed to fetch bikes" });
  }
};

exports.getTotalBikes = async (req, res) => {
  try {
    const total = await bikeService.getTotalBikes();
    res.status(200).json({ total });
  } catch (error) {
    console.error("Failed to get total bikes:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBikeById = async (req, res) => {
  try {
    const { id } = req.params;

    const bike = await bikeService.getBikeById(id);

    if (!bike) return res.status(404).json({ error: "Bike not found" });
    res.status(200).json(bike);
  } catch (error) {
    console.error(`Failed to get bike ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBike = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBike = await bikeService.updateBike(id, req.body, req.files);
    res.status(200).json(updatedBike);
  } catch (error) {
    console.error(`Error updating bike ${req.params.id}:`, error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBike = async (req, res) => {
  try {
    const bikeId = parseInt(req.params.id, 10);
    if (isNaN(bikeId)) {
      return res.status(400).json({ error: "Invalid bike ID provided." });
    }

    const deleteBike = await bikeService.deleteBikeById(bikeId);
    res.status(200).json({
      message: "Bike deleted successfully.",
      deletedId: deleteBike.id,
    });
  } catch (error) {
    console.error("Error deleting bike:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Bike not found." });
    }
    res.status(500).json({ error: error.message });
  }
};

// const generateCacheKey = (query) => {
//   const { limit, cursor, searchTerm, brands, sortBy } = query;
//   const keyObj = { limit: parseInt(limit) || 10, sortBy: sortBy || "newest" };

//   if (cursor) keyObj.cursor = cursor;
//   if (searchTerm) keyObj.search = searchTerm.toLowerCase();
//   if (brands) keyObj.brands = brands.split(",").sort().join(",");

//   return `bikes:list:${Buffer.from(JSON.stringify(keyObj)).toString("base64")}`;
// };

// const buildCursor = (bike, sortBy) => {
//   if (sortBy === "name_asc" || sortBy === "name_desc") {
//     return { title: bike.title, id: bike.id };
//   }
//   return { createdAt: bike.createdAt, id: bike.id };
// };

// const buildPrismaCursor = (cursor, sortBy) => {
//   const parsedCursor = JSON.parse(cursor);
//   if (sortBy === "name_asc" || sortBy === "name_desc") {
//     return {
//       title_id: {
//         title: parsedCursor.title,
//         id: parsedCursor.id,
//       },
//     };
//   }
//   return {
//     createdAt_id: {
//       createdAt: new Date(parsedCursor.createdAt),
//       id: parsedCursor.id,
//     },
//   };
// };

// exports.createBike = async (req, res) => {
//   try {
//     const {
//       title,
//       dealerId,
//       ybtPrice,
//       registrationNumber,
//       registrationYear,
//       kmsDriven,
//       ownerCount,
//       badges,
//       description,
//       brand,
//       vipNumber,
//       sellingPrice,
//       cutOffPrice,
//       insurance,
//       bikeUSP,
//       fuelType,
//       status,
//       specs,
//       engine,
//     } = req.body;

//     // --- Basic Validation ---
//     if (
//       !title ||
//       !dealerId ||
//       !ybtPrice ||
//       !registrationNumber ||
//       !registrationYear ||
//       !kmsDriven
//     ) {
//       return res.status(400).json({
//         message:
//           "Title, Dealer, YBT Price, Registration Number, Year, and Kms Driven are required.",
//       });
//     }

//     const files = req.files;
//     const bikeImages = [];
//     if (files && files.bikeImages) {
//       if (Array.isArray(files.bikeImages)) {
//         bikeImages.push(...files.bikeImages.map((file) => file.path));
//       } else {
//         bikeImages.push(files.bikeImages.path);
//       }
//     }

//     const processArrayField = (field) => {
//       if (!field) return [];
//       return Array.isArray(field) ? field : [field];
//     };
//     const processedBadges = processArrayField(badges);
//     const processedSpecs = processArrayField(specs);

//     // --- Create Bike in Database ---
//     const bike = await prisma.bike.create({
//       data: {
//         title,
//         registrationNumber,
//         insurance,
//         description,
//         brand,
//         bikeUSP,
//         engine,
//         specs: processedSpecs,
//         badges: processedBadges,
//         bikeImages,
//         thumbnail:
//           bikeImages[0] || "https://placehold.co/800x600?text=No+Image",
//         vipNumber: vipNumber === "true",

//         // --- Correctly Parsed Numbers and Enums ---
//         dealerId: parseInt(dealerId),
//         ybtPrice: parseFloat(ybtPrice),
//         registrationYear: parseInt(registrationYear),
//         kmsDriven: parseInt(kmsDriven),

//         // Safely parse optional number fields
//         ownerCount: ownerCount ? parseInt(ownerCount) : null,
//         sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
//         cutOffPrice: cutOffPrice ? parseFloat(cutOffPrice) : null,

//         // Let the schema's default handle these if not provided
//         status: status ? status.toUpperCase() : undefined,
//         fuelType: fuelType ? fuelType.toUpperCase() : undefined,
//       },
//     });

//     res.status(201).json(bike);
//   } catch (error) {
//     console.error("💥 FAILED TO CREATE BIKE:", error);
//     if (error.code === "P2002") {
//       return res.status(409).json({
//         message: "A bike with this registration number already exists.",
//       });
//     }
//     res.status(500).json({
//       message: "Failed to create bike.",
//       error: error.message,
//     });
//   }
// };
