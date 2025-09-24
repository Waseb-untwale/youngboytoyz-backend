// const { PrismaClient } = require("@prisma/client");
// const { faker } = require("@faker-js/faker");

// const prisma = new PrismaClient();

// const createSlug = (text) => {
//   return text
//     .toLowerCase()
//     .replace(/ /g, "-")
//     .replace(/[^\w-]+/g, "");
// };

// // --- Data Pools for Seeding ---
// const badgePool = [
//   "LOW_KMS",
//   "RARE_FIND",
//   "MINT_CONDITION",
//   "CUSTOM_BUILD",
//   "ONE_OWNER",
// ];
// const tuningStagePool = ["STAGE1", "STAGE2", "STAGE3"];
// const collectionTypePool = ["YBT", "DESIGNER", "WORKSHOP", "TORQUE_TUNER"];

// // --- Main Seeding Function ---
// async function main() {
//   console.log("🌱 Starting the comprehensive seeding process...");

//   // 1. CLEAR DATABASE
//   console.log("🗑️  Clearing previous data...");
//   await prisma.car.deleteMany({});
//   await prisma.workshop.deleteMany({});
//   await prisma.designer.deleteMany({});
//   await prisma.dealer.deleteMany({});

//   // 2. SEED DEALERS
//   console.log("🤵 Seeding Dealers...");
//   const dealersToCreate = [];
//   for (let i = 0; i < 5; i++) {
//     const companyName = faker.company.name();
//     dealersToCreate.push({
//       name: `${companyName} Motors`,
//       email: faker.internet.email({ firstName: companyName.split(" ")[0] }),
//       phone: faker.phone.number(),
//       address: faker.location.streetAddress(),
//       city: faker.location.city(),
//       state: faker.location.state(),
//     });
//   }
//   await prisma.dealer.createMany({ data: dealersToCreate });
//   const dealers = await prisma.dealer.findMany();
//   const dealerIds = dealers.map((d) => d.id);
//   console.log(`✅ Seeded ${dealers.length} dealers.`);

//   // 3. SEED DESIGNERS
//   console.log("🎨 Seeding Designers...");
//   const designersToCreate = [];
//   for (let i = 0; i < 3; i++) {
//     const name = faker.person.fullName();
//     designersToCreate.push({
//       name: name,
//       slug: createSlug(name),
//       title: faker.person.jobTitle(),
//       description: faker.lorem.paragraph(),
//       image: faker.image.avatar(),
//       stats: { projects: faker.number.int({ min: 10, max: 150 }) },
//     });
//   }
//   await prisma.designer.createMany({ data: designersToCreate });
//   const designers = await prisma.designer.findMany();
//   const designerIds = designers.map((d) => d.id);
//   console.log(`✅ Seeded ${designers.length} designers.`);

//   // 4. SEED WORKSHOPS
//   console.log("🔧 Seeding Workshops...");
//   const workshopsToCreate = [];
//   for (let i = 0; i < 4; i++) {
//     const name = `${faker.company.name()} Auto Works`;
//     workshopsToCreate.push({
//       name: name,
//       slug: createSlug(name),
//       title: "Certified Performance Center",
//       description: faker.lorem.paragraphs(2),
//       image: faker.image.urlLoremFlickr({ category: "technics" }),
//       stats: { carsTuned: faker.number.int({ min: 100, max: 2000 }) },
//     });
//   }
//   await prisma.workshop.createMany({ data: workshopsToCreate });
//   const workshops = await prisma.workshop.findMany();
//   const workshopIds = workshops.map((w) => w.id);
//   console.log(`✅ Seeded ${workshops.length} workshops.`);

//   // 5. SEED CARS
//   console.log("\n🚗 Seeding Cars with consistent data...");
//   const numberOfCars = 50;
//   const carsToCreate = [];
//   const carImagePool = [
//     "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
//     "https://images.unsplash.com/photo-1502877338535-766e1452684a",
//   ];

//   for (let i = 0; i < numberOfCars; i++) {
//     const brand = faker.vehicle.manufacturer();
//     const model = faker.vehicle.model();
//     const carImages = faker.helpers.arrayElements(carImagePool, {
//       min: 2,
//       max: 4,
//     });

//     // ✨ NEW: Logic to ensure collection data is consistent
//     const collectionType = faker.helpers.arrayElement(collectionTypePool);
//     let designerId = null;
//     let workshopId = null;
//     let tuningStage = null;

//     switch (collectionType) {
//       case "DESIGNER":
//         designerId = faker.helpers.arrayElement(designerIds);
//         break;
//       case "WORKSHOP":
//         workshopId = faker.helpers.arrayElement(workshopIds);
//         break;
//       case "TORQUE_TUNER":
//         tuningStage = faker.helpers.arrayElement(tuningStagePool);
//         break;
//       // For 'YBT' and other types, all special fields remain null
//     }

//     const carData = {
//       // --- Relations (now consistent) ---
//       dealerId: faker.helpers.arrayElement(dealerIds),
//       designerId,
//       workshopId,

//       // --- Core Info ---
//       title: `${brand} ${model}`,
//       description: faker.lorem.paragraph(),
//       status: faker.helpers.arrayElement([
//         "AVAILABLE",
//         "SOLD",
//         "PENDING",
//         "RESERVED",
//       ]),
//       collectionType,

//       // --- ✨ NEWLY ADDED FIELDS ✨ ---
//       tuningStage,
//       badges: faker.helpers.arrayElements(badgePool, { min: 0, max: 2 }),

//       // --- Other fields... ---
//       sellingPrice: parseFloat(
//         faker.commerce.price({ min: 500000, max: 5000000 })
//       ),
//       cutOffPrice: parseFloat(
//         faker.commerce.price({ min: 450000, max: 4800000 })
//       ),
//       ybtPrice: parseFloat(faker.commerce.price({ min: 480000, max: 4900000 })),
//       registrationYear: faker.date.past({ years: 10 }).getFullYear(),
//       registrationNumber: `${faker.location.state({
//         abbreviated: true,
//       })}${faker.string.numeric(2)}${faker.string
//         .alpha(2)
//         .toUpperCase()}${faker.string.numeric(4)}`,
//       kmsDriven: faker.number.int({ min: 10000, max: 150000 }),
//       brand,
//       thumbnail: carImages[0],
//       carImages,
//     };
//     carsToCreate.push(carData);
//   }

//   await prisma.car.createMany({ data: carsToCreate });
//   console.log(`✅ Seeded ${carsToCreate.length} cars.`);
// }

// // --- Execute the Main Function ---
// main()
//   .catch((e) => {
//     console.error("💥 FAILED TO SEED DATABASE:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     console.log("\n👋 Seeding finished. Disconnecting Prisma Client.");
//     await prisma.$disconnect();
//   });

const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

// --- Data Pools for Seeding ---
const badgePool = [
  "LOW_KMS",
  "RARE_FIND",
  "MINT_CONDITION",
  "CUSTOM_BUILD",
  "ONE_OWNER",
];
const tuningStagePool = ["STAGE1", "STAGE2", "STAGE3"];
const collectionTypePool = ["YBT", "DESIGNER", "WORKSHOP", "TORQUE_TUNER"];
const bikeBrandPool = [
  "Royal Enfield",
  "Harley-Davidson",
  "Ducati",
  "BMW",
  "Kawasaki",
  "Yamaha",
];
const bikeSpecPool = [
  "Dual-Channel ABS",
  "LED Lighting",
  "Slipper Clutch",
  "Ride-by-Wire",
  "Quick Shifter",
];
const bikeImagePool = [
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc",
  "https://images.unsplash.com/photo-1558981001-5864b3250a69",
  "https://images.unsplash.com/photo-1660159523843-79260d36ad36",
];

// --- Main Seeding Function ---
async function main() {
  console.log("🌱 Starting the additive seeding process for bikes...");

  // 1. CLEAR ONLY BIKE DATA
  // =============================================
  console.log("🗑️  Clearing previous BIKE data only...");
  await prisma.bike.deleteMany({});

  // --- The following sections are commented out to preserve existing data ---
  /*
  await prisma.car.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.designer.deleteMany({});
  await prisma.dealer.deleteMany({});
  */

  // 2. FETCH EXISTING DEALERS
  // =============================================
  console.log("🤵 Fetching existing dealers...");
  const dealers = await prisma.dealer.findMany();
  if (dealers.length === 0) {
    console.error(
      "💥 No dealers found. Please seed dealers before seeding bikes."
    );
    process.exit(1);
  }
  const dealerIds = dealers.map((d) => d.id);
  console.log(`✅ Found ${dealers.length} dealers to link bikes to.`);

  // 6. SEED BIKES (NEW SECTION)
  // =============================================
  console.log("\n🏍️  Seeding Bikes...");
  const numberOfBikes = 50;
  const bikesToCreate = [];

  for (let i = 0; i < numberOfBikes; i++) {
    const brand = faker.helpers.arrayElement(bikeBrandPool);
    const model = faker.vehicle.model(); // Using vehicle model as a generic name
    const bikeImages = faker.helpers.arrayElements(bikeImagePool, {
      min: 1,
      max: 3,
    });

    const bikeData = {
      // --- Relations ---
      dealerId: faker.helpers.arrayElement(dealerIds),

      // --- Core Info ---
      title: `${brand} ${model}`,
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(["AVAILABLE", "SOLD", "PENDING"]),
      collectionType: faker.helpers.arrayElement(collectionTypePool),
      brand,
      bikeUSP: faker.lorem.sentence(),

      // --- Pricing ---
      ybtPrice: parseFloat(faker.commerce.price({ min: 80000, max: 1500000 })),
      sellingPrice: faker.helpers.arrayElement([
        null,
        parseFloat(faker.commerce.price({ min: 90000, max: 1600000 })),
      ]),
      cutOffPrice: faker.helpers.arrayElement([
        null,
        parseFloat(faker.commerce.price({ min: 75000, max: 1400000 })),
      ]),

      // --- Registration & History ---
      registrationYear: faker.date.past({ years: 8 }).getFullYear(),
      registrationNumber: `MH${faker.string.numeric(2)}${faker.string
        .alpha(2)
        .toUpperCase()}${faker.string.numeric(4)}`,
      kmsDriven: faker.number.int({ min: 5000, max: 90000 }),
      ownerCount: faker.helpers.arrayElement([1, 2, 3, null]),
      insurance: faker.helpers.arrayElement([
        "Comprehensive",
        "Third Party",
        null,
      ]),

      // --- Features & Specs ---
      vipNumber: faker.datatype.boolean(),
      badges: faker.helpers.arrayElements(badgePool, { min: 0, max: 2 }),
      specs: faker.helpers.arrayElements(bikeSpecPool, { min: 1, max: 3 }),
      engine: `${faker.number.int({ min: 150, max: 1200 })} cc`,
      fuelType: faker.helpers.arrayElement(["PETROL", "DIESEL", "ELECTRIC"]),

      // --- Media ---
      thumbnail: bikeImages[0],
      bikeImages,
    };
    bikesToCreate.push(bikeData);
  }

  await prisma.bike.createMany({ data: bikesToCreate });
  console.log(`✅ Seeded ${bikesToCreate.length} bikes.`);
}

// --- Execute the Main Function ---
main()
  .catch((e) => {
    console.error("💥 FAILED TO SEED DATABASE:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n👋 Seeding finished. Disconnecting Prisma Client.");
    await prisma.$disconnect();
  });
