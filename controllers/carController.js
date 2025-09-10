const prisma = require("../utils/prisma");
const createSlug = require("../utils/slugify");
const redis = require("../utils/redis");

const clearListCaches = async () => {
  console.log("Clearing list caches...");
  const keys = await redis.keys("cars:all:*"); // Find all keys for getAllCars
  if (keys.length > 0) {
    await redis.del(keys); // Delete them
  }
  await redis.del("cars:total"); // Delete the total count
};

// Create a new car
exports.createCar = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      // Pricing
      sellingPrice,
      cutOffPrice,
      ybtPrice,
      //registration and ownership
      registrationYear,
      registrationNumber,
      manufactureYear,
      kmsDriven,
      ownerCount,
      insurance,
      //other specs
      dealerId,
      badges,
      vipNumber,
      city,
      state,
      //car Details
      brand,
      carUSP,
      carType,
      transmission,
      exteriorColour,
      peakTorque,
      peakPower,
      doors,
      driveType,
      seatingCapacity,
      engine,
      fuelType,
      mileage,
    } = req.body;

    if (!dealerId) {
      return res.status(400).json({ message: "A dealerId is required." });
    }

    const slug = createSlug(`${brand} ${title}`);

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
        dealerId: parseInt(dealerId),
        status: status ? status.toUpperCase() : undefined,
        city,
        state,
        mileage: mileage ? parseFloat(mileage) : null,
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
        slug,
        brand,
        carUSP,
        carType,
        transmission,
        exteriorColour,
        peakTorque,
        peakPower,
        doors: parseInt(doors),
        driveType: driveType ? driveType.toUpperCase() : undefined,
        seatingCapacity: parseInt(seatingCapacity),
        manufactureYear: parseInt(manufactureYear),
        engine,
        fuelType: fuelType ? fuelType.toUpperCase() : undefined,
        carImages,
        thumbnail:
          carImages[0] ||
          "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available",
      },
    });

    await clearListCaches();

    res.status(201).json(car);
  } catch (error) {
    console.error("💥 FAILED TO CREATE CAR:", error);

    res.status(500).json({
      message: "Failed to create car.",
      error: error.message,
    });
  }
};

exports.getAllCars = async (req, res) => {
  const cacheKey = `cars:all:${req.originalUrl}`;

  try {
    let cachedCars = null;

    try {
      cachedCars = await redis.get(cacheKey);
    } catch (cacheError) {
      console.error("Redis error on GET:", cacheError.message);
    }

    if (cachedCars) {
      console.log("Serving getAllCars from cache...  cache ⚡");
      return res.json(JSON.parse(cachedCars));
    }

    console.log("Fetching getAllCars from database... 💿");
    // --- Pagination ---
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? JSON.parse(req.query.cursor) : undefined;

    // --- New Filter and Sort Parameters ---
    const { searchTerm, brands, sortBy = "newest" } = req.query; // Default sort to 'newest'

    // --- Build Dynamic WHERE clause for Prisma ---
    const where = {};

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (brands) {
      // Expecting a comma-separated string like "Audi,BMW,Ferrari"
      const brandList = brands.split(",");
      if (brandList.length > 0) {
        where.brand = { in: brandList };
      }
    }

    // --- Build Dynamic ORDER BY clause for Prisma ---
    let orderBy;
    switch (sortBy) {
      case "name_asc": // name (A-Z)
        orderBy = { title: "asc" };
        break;
      case "name_desc": // name (Z-A)
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

    // --- Construct the final Prisma query ---
    const prismaQueryOptions = {
      take: limit,
      where, // Apply the dynamic where clause
      orderBy, // Apply the dynamic order by clause
      select: {
        // Selecting only necessary fields
        id: true,
        title: true,
        description: true,
        brand: true,
        badges: true,
        thumbnail: true, // Assuming this is the relation/field name
        createdAt: true, // Needed for cursor
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

    const cars = await prisma.car.findMany(prismaQueryOptions);

    // --- Determine the next cursor ---
    let nextCursor = null;
    if (cars.length === limit) {
      const lastCar = cars[cars.length - 1];
      nextCursor = JSON.stringify({
        createdAt: lastCar.createdAt,
        id: lastCar.id,
      });
    }

    const responseData = { data: cars, nextCursor };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);

    res.json(responseData);
  } catch (err) {
    console.error("Error in getAllCars:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getTotalCars = async (req, res) => {
  const cacheKey = "cars:total";
  try {
    const cachedTotal = await redis.get(cacheKey);

    if (cachedTotal) {
      console.log("Serving total cars from cache... ⚡");
      return res.status(200).json({ total: parseInt(cachedTotal) });
    }

    console.log("Fetching total cars from database... 💿");
    const totalCars = await prisma.car.count();

    await redis.set(cacheKey, totalCars, "EX", 300);
    res.status(200).json({ total: totalCars });
  } catch (error) {
    console.error("Failed to get total cars:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCarById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `cars:${id}`;
  try {
    const cachedCar = await redis.get(cacheKey);

    if (cachedCar) {
      console.log(`Serving car ${id} from cache... ⚡`);
      return res.json(JSON.parse(cachedCar));
    }

    console.log(`Fetching car ${id} from database... 💿`);
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
      include: {
        dealer: true,
      },
    });

    if (!car) return res.status(404).json({ error: "Car not found" });

    await redis.set(cacheKey, JSON.stringify(car), "EX", 3600);
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCar = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCar = await prisma.car.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    await clearListCaches();
    await redis.del(`cars:${id}`);
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createGuestBooking = async (req, res) => {
  try {
    const { carId } = req.params;
    // Get the data from the form the user filled out
    const { name, email, phone, address } = req.body;

    // --- Validation ---
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required." });
    }

    const newLead = await prisma.$transaction(async (tx) => {
      const car = await tx.car.findUnique({ where: { id: parseInt(carId) } });
      if (!car) throw new Error("Car not found.");
      if (car.status !== "AVAILABLE")
        throw new Error("This car is not available for booking.");

      // Create a record in the new BookingLead table
      const lead = await tx.bookingLead.create({
        data: {
          carId: parseInt(carId),
          name,
          email,
          phone,
          address,
        },
      });

      // Also reserve the car so no one else can book it
      await tx.car.update({
        where: { id: parseInt(carId) },
        data: { status: "RESERVED" },
      });

      return lead;
    });

    res.status(201).json({
      message: "Thank you for your interest! We will contact you shortly.",
      lead: newLead,
    });
  } catch (error) {
    console.error("Failed to create guest booking:", error);
    if (error.message.includes("not found"))
      return res.status(404).json({ message: error.message });
    if (error.message.includes("not available"))
      return res.status(409).json({ message: error.message });
    res.status(500).json({ message: "Unable to process your request." });
  }
};

exports.bookCar = async (req, res) => {
  try {
    // 1. Get the carId from the URL parameters
    const { carId } = req.params;
    // 2. Get the authenticated user's ID from the token (via auth middleware)
    const userId = req.user.id;
    // 3. Get the updated contact info from the form body
    const { name, phone, address, email } = req.body;

    // --- Update the user's main profile with the latest info (optional but good practice) ---
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { name, phoneNumber, address, email },
    // });

    // --- Use a transaction to create the booking ---
    const newOwnership = await prisma.$transaction(async (tx) => {
      // Find the car to ensure it exists and is available
      const car = await tx.car.findUnique({
        where: { id: parseInt(carId) },
      });

      if (!car) throw new Error("Car not found.");
      if (car.status !== "AVAILABLE")
        throw new Error("This car is not available for booking.");

      // Check if the user has already booked this car
      const existingBooking = await tx.carOwnership.findUnique({
        where: { userId_carId: { userId, carId: parseInt(carId) } },
      });
      if (existingBooking)
        throw new Error("You have already registered interest in this car.");

      // Create the record in the CarOwnership table
      const ownership = await tx.carOwnership.create({
        data: {
          userId: userId, // Use the ID from the token
          carId: parseInt(carId),
          // 'status' defaults to PENDING as per your schema
        },
      });

      // Update the car's status to RESERVED
      await tx.car.update({
        where: { id: parseInt(carId) },
        data: { status: "RESERVED" },
      });

      return ownership;
    });

    res.status(201).json({
      message: "Booking successful! Your request is pending review.",
      booking: newOwnership,
    });
  } catch (error) {
    console.error("Failed to book car:", error);
    if (error.message.includes("not found"))
      return res.status(404).json({ message: error.message });
    if (
      error.message.includes("not available") ||
      error.message.includes("already registered")
    ) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: "Unable to process booking request." });
  }
};

exports.deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.car.delete({
      where: { id: parseInt(req.params.id) },
    });
    await clearListCaches();
    await redis.del(`cars:${id}`);
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
