const prisma = require("../utils/prisma");

const getImageUrls = (files) => {
  if (!files || !files.bikeImages) {
    return [];
  }
  return files.bikeImages.map((file) => file.path);
};

exports.createBike = async (bikeData, files) => {
  const imageUrls = getImageUrls(files);
  const { dealerId, ...restOfBikeData } = bikeData;

  const dataForDatabase = {
    ...restOfBikeData,
    bikeImages: imageUrls,
    thumbnail:
      imageUrls[0] ||
      "https://placehold.co/800x600/EFEFEF/AAAAAA?text=Image+Not+Available",
    dealer: {
      connect: { id: dealerId },
    },
  };

  const newBike = await prisma.bike.create({
    data: dataForDatabase,
  });

  return newBike;
};

exports.getAllBikes = async (queryParams) => {
  // 1. Sanitize and prepare inputs
  const { cursor, searchTerm, brands } = queryParams;
  const limit = parseInt(queryParams.limit) || 10;
  const allowedSorts = ["newest", "oldest", "name_asc", "name_desc"];
  const sortBy = allowedSorts.includes(queryParams.sortBy)
    ? queryParams.sortBy
    : "newest";

  // 2. Build dynamic WHERE clause
  const where = {};
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
      .filter((b) => b);
    if (brandList.length > 0) where.brand = { in: brandList };
  }

  // 3. Build dynamic ORDER BY clause
  const orderByMap = {
    name_asc: [{ title: "asc" }, { id: "asc" }],
    name_desc: [{ title: "desc" }, { id: "asc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    newest: [{ createdAt: "desc" }, { id: "desc" }],
  };
  const orderBy = orderByMap[sortBy] || orderByMap.newest;

  // 4. Construct the Prisma query
  const prismaQuery = {
    take: limit + 1,
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      brand: true,
      specs: true,
      badges: true,
      ybtPrice: true,
      thumbnail: true,
      createdAt: true,
    },
  };

  // 5. ✨ SIMPLIFIED CURSOR LOGIC ✨
  if (cursor) {
    prismaQuery.cursor = { id: parseInt(cursor) };
    prismaQuery.skip = 1;
  }
  const results = await prisma.bike.findMany(prismaQuery);

  // 6. ✨ SIMPLIFIED PAGINATION LOGIC ✨
  const hasMore = results.length > limit;
  const bikes = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore ? bikes[bikes.length - 1].id : null;

  // 7. Prepare the final response
  return {
    data: bikes,
    pagination: { hasMore, nextCursor },
    filters: { searchTerm: searchTerm || null, brands: brands || null, sortBy },
  };
};

exports.updateBike = async (id, updateData, files) => {
  const bikeId = parseInt(id);
  const dataToUpdate = { ...updateData };

  if (files && files.bikeImages) {
    dataToUpdate.bikeImages = files.bikeImages.map((file) => file.path);
  }
  if (files && files.thumbnail && files.thumbnail[0]) {
    dataToUpdate.thumbnail = files.thumbnail[0].path;
  }

  // 2. Coerce data types (A Zod validator is the best place for this)
  if (dataToUpdate.vipNumber !== undefined) {
    dataToUpdate.vipNumber = ["true", true].includes(dataToUpdate.vipNumber);
  }
  ["sellingPrice", "cutOffPrice", "ybtPrice"].forEach((field) => {
    if (dataToUpdate[field]) {
      dataToUpdate[field] = parseFloat(dataToUpdate[field]);
    }
  });

  const updatedBike = await prisma.bike.update({
    where: { id: bikeId },
    data: dataToUpdate,
  });

  return updatedBike;
};

exports.getTotalBikes = async () => {
  const totalBikes = await prisma.bike.count();
  return totalBikes;
};

exports.getBikeById = async (id) => {
  const bike = await prisma.bike.findUnique({
    where: { id: parseInt(id) },
    include: {
      dealer: true,
      ownerships: true,
    },
  });

  return bike;
};

exports.deleteBikeById = async (id) => {
  const bikeId = parseInt(id);
  const deletedBike = await prisma.bike.delete({
    where: { id: bikeId },
    select: { id: true },
  });
  return deletedBike;
};

// exports.getAllBikes = async (queryParams) => {
//   // 1. Sanitize and prepare inputs
//   const { cursor, searchTerm, brands } = queryParams;
//   const limit = Math.min(parseInt(queryParams.limit) || 10, 100);
//   const allowedSorts = ["newest", "oldest", "name_asc", "name_desc"];
//   const sortBy = allowedSorts.includes(queryParams.sortBy)
//     ? queryParams.sortBy
//     : "newest";

//   // 3. Build dynamic WHERE clause
//   const where = {};
//   if (searchTerm) {
//     where.OR = [
//       { title: { contains: searchTerm, mode: "insensitive" } },
//       { description: { contains: searchTerm, mode: "insensitive" } },
//     ];
//   }
//   if (brands) {
//     const brandList = brands
//       .split(",")
//       .map((b) => b.trim())
//       .filter((b) => b);
//     if (brandList.length > 0) where.brand = { in: brandList };
//   }

//   // 4. Build dynamic ORDER BY clause
//   const orderByMap = {
//     name_asc: { title: "asc" },
//     name_desc: { title: "desc" },
//     oldest: { createdAt: "asc" },
//     newest: { createdAt: "desc" },
//   };
//   const orderBy = orderByMap[sortBy];

//   // 5. Construct and execute the Prisma query
//   const prismaQuery = {
//     take: limit + 1,
//     where,
//     orderBy,
//     select: {
//       id: true,
//       title: true,
//       brand: true,
//       specs: true,
//       badges: true,
//       ybtPrice: true,
//       thumbnail: true,
//       createdAt: true,
//     },
//   };
//   if (cursor) {
//     prismaQuery.cursor = buildPrismaCursor(cursor, sortBy);
//     prismaQuery.skip = 1;
//   }
//   const results = await prisma.bike.findMany(prismaQuery);

//   // 6. Pagination logic
//   const hasMore = results.length > limit;
//   const bikes = hasMore ? results.slice(0, limit) : results;
//   let nextCursor = null;
//   if (hasMore && bikes.length > 0) {
//     nextCursor = JSON.stringify(buildCursor(bikes[bikes.length - 1], sortBy));
//   }

//   // 7. Prepare and cache the final response
//   const responseData = {
//     data: bikes,
//     pagination: { hasMore, nextCursor },
//     filters: { searchTerm: searchTerm || null, brands: brands || null, sortBy },
//   };

//   return responseData;
// };
