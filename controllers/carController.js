const carService = require("../services/carService");

exports.createCar = async (req, res) => {
  try {
    if (
      !req.files ||
      !req.files.carImages ||
      req.files.carImages.length === 0
    ) {
      return res.status(400).json({
        errors: [{ message: "At least one car image is required." }],
      });
    }

    const newCar = await carService.createCar(req.body, req.files);
    res.status(201).json(newCar);
  } catch (error) {
    console.error("💥 FAILED TO CREATE CAR:", error);
    res.status(500).json({
      message: "Failed to create car.",
      error: error.message,
    });
  }
};

exports.getAllCars = async (req, res) => {
  try {
    const result = await carService.getAllCars(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getAllCars:", error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
};

exports.getTotalCars = async (req, res) => {
  try {
    const total = await carService.getTotalCars();
    res.status(200).json({ total });
  } catch (error) {
    console.error("Failed to get total cars:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await carService.getCarById(id);

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.status(200).json(car);
  } catch (err) {
    console.error(`Failed to get car ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCarsByDealer = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const id = parseInt(dealerId, 10);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "Dealer ID must be a valid number." });
    }

    const cars = await carService.getCarsByDealer(id);

    res.status(200).json(cars);
  } catch (error) {
    console.error(
      `💥 FAILED TO FETCH CARS FOR DEALER ${req.params.dealerId}:`,
      error
    );
    res.status(500).json({
      message: "Failed to fetch cars for the dealer.",
      error: error.message,
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCar = await carService.updateCar(id, req.body, req.files);
    res.status(200).json(updatedCar);
  } catch (err) {
    console.error(`💥 FAILED TO UPDATE CAR ${req.params.id}:`, err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const carId = parseInt(req.params.id, 10);
    if (isNaN(carId)) {
      return res.status(400).json({ error: "Invalid car ID provided." });
    }

    const deletedCar = await carService.deleteCar(carId);

    res.status(200).json({
      message: "Car deleted successfully.",
      deletedId: deletedCar.id,
    });
  } catch (err) {
    console.error("Error in deleteCar:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Car not found." });
    }
    res.status(500).json({ error: "Failed to delete car." });
  }
};

// exports.createGuestBooking = async (req, res) => {
//   try {
//     const { carId } = req.params;
//     const { name, email, phone, address } = req.body;

//     if (!name || !email || !phone) {
//       return res
//         .status(400)
//         .json({ message: "Name, email, and phone are required." });
//     }

//     const newLead = await prisma.$transaction(async (tx) => {
//       const car = await tx.car.findUnique({ where: { id: parseInt(carId) } });
//       if (!car) throw new Error("Car not found.");
//       if (car.status !== "AVAILABLE")
//         throw new Error("This car is not available for booking.");

//       const lead = await tx.bookingLead.create({
//         data: {
//           carId: parseInt(carId),
//           name,
//           email,
//           phone,
//           address,
//         },
//       });

//       // Also reserve the car so no one else can book it
//       await tx.car.update({
//         where: { id: parseInt(carId) },
//         data: { status: "RESERVED" },
//       });

//       return lead;
//     });

//     res.status(201).json({
//       message: "Thank you for your interest! We will contact you shortly.",
//       lead: newLead,
//     });
//   } catch (error) {
//     console.error("Failed to create guest booking:", error);
//     if (error.message.includes("not found"))
//       return res.status(404).json({ message: error.message });
//     if (error.message.includes("not available"))
//       return res.status(409).json({ message: error.message });
//     res.status(500).json({ message: "Unable to process your request." });
//   }
// };

// exports.bookCar = async (req, res) => {
//   try {
//     // 1. Get the carId from the URL parameters
//     const { carId } = req.params;
//     // 2. Get the authenticated user's ID from the token (via auth middleware)
//     const userId = req.user.id;
//     // 3. Get the updated contact info from the form body
//     const { name, phone, address, email } = req.body;

//     // --- Update the user's main profile with the latest info (optional but good practice) ---
//     // await prisma.user.update({
//     //   where: { id: userId },
//     //   data: { name, phoneNumber, address, email },
//     // });

//     // --- Use a transaction to create the booking ---
//     const newOwnership = await prisma.$transaction(async (tx) => {
//       // Find the car to ensure it exists and is available
//       const car = await tx.car.findUnique({
//         where: { id: parseInt(carId) },
//       });

//       if (!car) throw new Error("Car not found.");
//       if (car.status !== "AVAILABLE")
//         throw new Error("This car is not available for booking.");

//       // Check if the user has already booked this car
//       const existingBooking = await tx.carOwnership.findUnique({
//         where: { userId_carId: { userId, carId: parseInt(carId) } },
//       });
//       if (existingBooking)
//         throw new Error("You have already registered interest in this car.");

//       // Create the record in the CarOwnership table
//       const ownership = await tx.carOwnership.create({
//         data: {
//           userId: userId, // Use the ID from the token
//           carId: parseInt(carId),
//           // 'status' defaults to PENDING as per your schema
//         },
//       });

//       // Update the car's status to RESERVED
//       await tx.car.update({
//         where: { id: parseInt(carId) },
//         data: { status: "RESERVED" },
//       });

//       return ownership;
//     });

//     res.status(201).json({
//       message: "Booking successful! Your request is pending review.",
//       booking: newOwnership,
//     });
//   } catch (error) {
//     console.error("Failed to book car:", error);
//     if (error.message.includes("not found"))
//       return res.status(404).json({ message: error.message });
//     if (
//       error.message.includes("not available") ||
//       error.message.includes("already registered")
//     ) {
//       return res.status(409).json({ message: error.message }); // 409 Conflict
//     }
//     res.status(500).json({ message: "Unable to process booking request." });
//   }
// };

////////////////////////////////////////////////////////////////////////
// const clearListCaches = async () => {
//   console.log("Clearing list caches...");
//   // Update the pattern to match the new cache keys
//   const keys = await redis.sendCommand(["KEYS", "cars:list:*"]);
//   if (keys.length > 0) {
//     await redis.del(keys);
//   }
//   // Remove any other specific list-related keys if needed
//   // await redis.del("cars:total");
// };

// const generateCacheKey = (query) => {
//   const { limit, cursor, searchTerm, brands, sortBy } = query;
//   // Normalize parameters to create a consistent key
//   const keyObj = {
//     limit: parseInt(limit) || 10,
//     sortBy: sortBy || "newest",
//   };

//   if (cursor) keyObj.cursor = cursor;
//   if (searchTerm) keyObj.search = searchTerm.toLowerCase();
//   if (brands) keyObj.brands = brands.split(",").sort().join(",");

//   return `cars:list:${Buffer.from(JSON.stringify(keyObj)).toString("base64")}`;
// };

// const buildCursor = (car, sortBy) => {
//   if (sortBy === "name_asc" || sortBy === "name_desc") {
//     return { title: car.title, id: car.id };
//   }
//   return { createdAt: car.createdAt, id: car.id };
// };

// Helper function to build the Prisma cursor object
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

// exports.getAllCars = async (req, res) => {
//   const cacheKey = `cars:all:${req.originalUrl}`;

//   try {
//     let cachedCars = null;

//     try {
//       cachedCars = await redis.get(cacheKey);
//     } catch (cacheError) {
//       console.error("Redis error on GET:", cacheError.message);
//     }

//     if (cachedCars) {
//       console.log("Serving getAllCars from cache...  cache ⚡");
//       return res.json(JSON.parse(cachedCars));
//     }

//     console.log("Fetching getAllCars from database... 💿");
//     // --- Pagination ---
//     const limit = parseInt(req.query.limit) || 10;
//     const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : undefined;

//     // --- New Filter and Sort Parameters ---
//     const { searchTerm, brands, sortBy = "newest" } = req.query; // Default sort to 'newest'

//     // --- Build Dynamic WHERE clause for Prisma ---
//     const where = {};

//     if (searchTerm) {
//       where.OR = [
//         { title: { contains: searchTerm, mode: "insensitive" } },
//         { description: { contains: searchTerm, mode: "insensitive" } },
//       ];
//     }

//     if (brands) {
//       // Expecting a comma-separated string like "Audi,BMW,Ferrari"
//       const brandList = brands.split(",");
//       if (brandList.length > 0) {
//         where.brand = { in: brandList };
//       }
//     }

//     // --- Build Dynamic ORDER BY clause for Prisma ---
//     let orderBy;
//     switch (sortBy) {
//       case "name_asc": // name (A-Z)
//         orderBy = { title: "asc" };
//         break;
//       case "name_desc": // name (Z-A)
//         orderBy = { title: "desc" };
//         break;
//       case "oldest":
//         orderBy = [{ createdAt: "asc" }, { id: "asc" }];
//         break;
//       case "newest":
//       default:
//         orderBy = [{ createdAt: "desc" }, { id: "desc" }];
//         break;
//     }

//     // --- Construct the final Prisma query ---
//     const prismaQueryOptions = {
//       take: limit,
//       where, // Apply the dynamic where clause
//       orderBy, // Apply the dynamic order by clause
//       select: {
//         // Selecting only necessary fields
//         id: true,
//         title: true,
//         brand: true,
//         badges: true,
//         ybtPrice: true,
//         thumbnail: true, // Assuming this is the relation/field name
//         createdAt: true, // Needed for cursor
//       },
//     };

//     if (cursor && (sortBy === "newest" || sortBy === "oldest")) {
//       prismaQueryOptions.cursor = {
//         createdAt_id: {
//           createdAt: new Date(cursor.createdAt),
//           id: cursor.id,
//         },
//       };
//       prismaQueryOptions.skip = 1;
//     }

//     const cars = await prisma.car.findMany(prismaQueryOptions);

//     // --- Determine the next cursor ---
//     let nextCursor = null;
//     if (cars.length === limit) {
//       const lastCar = cars[cars.length - 1];
//       nextCursor = JSON.stringify({
//         createdAt: lastCar.createdAt,
//         id: lastCar.id,
//       });
//     }

//     const responseData = { data: cars, nextCursor };

//     await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);

//     res.json(responseData);
//   } catch (err) {
//     console.error("Error in getAllCars:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// exports.createCar = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       status,
//       sellingPrice,
//       cutOffPrice,
//       ybtPrice,
//       registrationYear,
//       registrationNumber,
//       manufactureYear,
//       kmsDriven,
//       ownerCount,
//       insurance,
//       dealerId,
//       badges,
//       vipNumber,
//       city,
//       state,
//       brand,
//       carUSP,
//       carType,
//       transmission,
//       exteriorColour,
//       peakTorque,
//       peakPower,
//       doors,
//       driveType,
//       seatingCapacity,
//       engine,
//       fuelType,
//       mileage,
//       collectionType,
//       designerId,
//       workshopId,
//     } = req.body;

//     if (!dealerId) {
//       return res.status(400).json({ message: "A dealerId is required." });
//     }

//     // ADDED: Business logic to ensure data integrity
//     if (!collectionType) {
//       return res.status(400).json({ message: "A collectionType is required." });
//     }
//     if (collectionType === "DESIGNER" && workshopId) {
//       return res
//         .status(400)
//         .json({ message: "A designer car cannot have a workshop ID." });
//     }
//     if (collectionType === "WORKSHOP" && designerId) {
//       return res
//         .status(400)
//         .json({ message: "A workshop car cannot have a designer ID." });
//     }
//     if (collectionType === "DESIGNER" && !designerId) {
//       return res.status(400).json({
//         message: "A designer ID is required for this collection type.",
//       });
//     }
//     if (collectionType === "WORKSHOP" && !workshopId) {
//       return res.status(400).json({
//         message: "A workshop ID is required for this collection type.",
//       });
//     }

//     const files = req.files;
//     const carImages = [];
//     if (files && files.carImages) {
//       if (Array.isArray(files.carImages)) {
//         carImages.push(...files.carImages.map((file) => file.path));
//       } else {
//         carImages.push(files.carImages.path);
//       }
//     }

//     let processedBadges = [];
//     if (badges) {
//       if (Array.isArray(badges)) {
//         processedBadges = badges;
//       } else {
//         processedBadges = [badges];
//       }
//     }

//     const car = await prisma.car.create({
//       data: {
//         title,
//         dealerId: parseInt(dealerId),
//         status: status ? status.toUpperCase() : undefined,
//         city,
//         state,
//         mileage: mileage ? parseFloat(mileage) : null,
//         registrationYear: parseInt(registrationYear),
//         kmsDriven: parseInt(kmsDriven),
//         ownerCount: ownerCount ? parseInt(ownerCount) : null,
//         registrationNumber,
//         vipNumber: vipNumber === "true",
//         sellingPrice: parseFloat(sellingPrice),
//         cutOffPrice: parseFloat(cutOffPrice),
//         ybtPrice: parseFloat(ybtPrice),
//         insurance,
//         badges: processedBadges,
//         description,
//         brand,
//         carUSP,
//         carType,
//         transmission,
//         exteriorColour,
//         peakTorque,
//         peakPower,
//         doors: doors ? parseInt(doors) : null,
//         driveType: driveType ? driveType.toUpperCase() : undefined,
//         seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
//         manufactureYear: manufactureYear ? parseInt(manufactureYear) : null,
//         engine,
//         fuelType: fuelType ? fuelType.toUpperCase() : undefined,
//         carImages,
//         thumbnail:
//           carImages[0] ||
//           "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available",

//         // ADDED: Pass the new fields to Prisma
//         collectionType,
//         designerId: designerId ? parseInt(designerId) : null,
//         workshopId: workshopId ? parseInt(workshopId) : null,
//       },
//     });

//     // await clearListCaches();

//     res.status(201).json(car);
//   } catch (error) {
//     console.error("💥 FAILED TO CREATE CAR:", error);
//     res.status(500).json({
//       message: "Failed to create car.",
//       error: error.message,
//     });
//   }
// };
