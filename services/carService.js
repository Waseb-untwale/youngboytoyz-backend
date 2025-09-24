const prisma = require("../utils/prisma");

const getImageUrls = (files) => {
  if (!files || !files.carImages) {
    return [];
  }
  return files.carImages.map((file) => file.path);
};

exports.createCar = async (carData, files) => {
  const imageUrls = getImageUrls(files);

  const { dealerId, designerId, workshopId, ...restOfCarData } = carData;

  const dataForDatabase = {
    ...restOfCarData,
    carImages: imageUrls,
    thumbnail:
      imageUrls[0] ||
      "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available",
    dealer: {
      connect: { id: dealerId },
    },
  };

  if (designerId) {
    dataForDatabase.designer = { connect: { id: designerId } };
  }
  if (workshopId) {
    dataForDatabase.workshop = { connect: { id: workshopId } };
  }

  const dbQueryStartTime = Date.now();
  const newCar = await prisma.car.create({
    data: dataForDatabase,
  });
  const dbQueryTime = Date.now() - dbQueryStartTime;
  console.log(`[PERF] Prisma create query took: ${dbQueryTime}ms`);
  return newCar;
};

exports.getTotalCars = async () => {
  const totalCars = await prisma.car.count();
  return totalCars;
};

exports.getCarById = async (id) => {
  const car = await prisma.car.findUnique({
    where: { id: parseInt(id) },
    include: {
      dealer: true,
      ownerships: true,
    },
  });

  return car;
};

exports.getCarsByDealer = async (dealerId) => {
  const id = parseInt(dealerId);

  const cars = await prisma.car.findMany({
    where: {
      dealerId: id,
    },
    select: {
      id: true,
      title: true,
      brand: true,
      badges: true,
      ybtPrice: true,
      thumbnail: true,
      createdAt: true,
      dealer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return cars;
};

exports.updateCar = async (id, updateData, files) => {
  const carId = parseInt(id);

  if (files && files.carImages) {
    const newImageUrls = files.carImages.map((file) => file.path);
    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
      select: { carImages: true },
    });

    updateData.carImages = [...(existingCar?.carImages || []), ...newImageUrls];
  }

  // 2. Coerce string numbers to integers (Zod validator would be better)
  // This step can be removed if you add a Zod validator for the update route
  if (updateData.dealerId) {
    updateData.dealerId = parseInt(updateData.dealerId);
  }
  if (updateData.kmsDriven) {
    updateData.kmsDriven = parseInt(updateData.kmsDriven);
  }

  const updatedCar = await prisma.car.update({
    where: { id: carId },
    data: updateData,
  });

  return updatedCar;
};

exports.deleteCar = async (id) => {
  const carId = parseInt(id);

  const deletedCar = await prisma.car.delete({
    where: { id: carId },
    select: { id: true },
  });

  return deletedCar;
};

exports.getAllCars = async (queryParams) => {
  const { cursor, searchTerm, brands, sortBy, collectionType, designerId } =
    queryParams;
  const limit = parseInt(queryParams.limit) || 10;

  const where = {};
  if (collectionType)
    where.collectionType = { equals: collectionType.toUpperCase() };
  if (designerId) where.designerId = parseInt(designerId);
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
  if (brands) {
    const brandList = brands
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    if (brandList.length > 0) where.brand = { in: brandList };
  }

  const orderByMap = {
    name_asc: [{ title: "asc" }, { id: "asc" }],
    name_desc: [{ title: "desc" }, { id: "asc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    newest: [{ createdAt: "desc" }, { id: "desc" }],
  };
  const orderBy = orderByMap[sortBy] || orderByMap.newest;

  const prismaQuery = {
    take: limit + 1,
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      brand: true,
      badges: true,
      ybtPrice: true,
      tuningStage: true,
      thumbnail: true,
      createdAt: true,
    },
  };
  if (cursor) {
    prismaQuery.cursor = { id: parseInt(cursor) };
    prismaQuery.skip = 1;
  }
  const results = await prisma.car.findMany(prismaQuery);

  const hasMore = results.length > limit;
  const cars = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? cars[cars.length - 1].id : null;

  return {
    data: cars,
    pagination: {
      hasMore,
      nextCursor,
    },
  };
};
