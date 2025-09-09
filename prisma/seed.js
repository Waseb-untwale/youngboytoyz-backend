const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

// Free Unsplash car images (high-quality, hotlinkable)
const carImagePool = [
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a",
  "https://images.unsplash.com/photo-1511391033795-2b1d6fbb74cd",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
  "https://images.unsplash.com/photo-1549921296-3a0830b72b07",
  "https://images.unsplash.com/photo-1517949908110-bbcf576da1a5",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
  "https://images.unsplash.com/photo-1552519507-2b1d6fbb74cd",
  "https://images.unsplash.com/photo-1597009513361-1cfb3e1d4c89",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
];

async function main() {
  console.log("🌱 Starting the seeding process...");

  await prisma.car.deleteMany({});
  console.log("🗑️  Cleared previous car data.");

  const numberOfCars = 100; // reduced for testing

  for (let i = 0; i < numberOfCars; i++) {
    const brand = faker.vehicle.manufacturer();
    const model = faker.vehicle.model();
    const title = `${brand} ${model}`;
    const slug = createSlug(`${title}-${faker.string.alphanumeric(6)}`);

    // pick 3–4 random images from pool
    const carImages = faker.helpers.arrayElements(carImagePool, {
      min: 3,
      max: 4,
    });

    const carData = {
      title,
      slug,
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(["AVAILABLE", "SOLD", "PENDING"]),
      sellingPrice: parseFloat(
        faker.commerce.price({ min: 500000, max: 5000000 })
      ),
      cutOffPrice: parseFloat(
        faker.commerce.price({ min: 450000, max: 4800000 })
      ),
      ybtPrice: parseFloat(faker.commerce.price({ min: 480000, max: 4900000 })),
      registrationYear: faker.date.past({ years: 10 }).getFullYear(),
      manufactureYear: faker.date.past({ years: 11 }).getFullYear(),
      registrationNumber: `${faker.location.state({
        abbreviated: true,
      })}${faker.string.numeric(2)}${faker.string
        .alpha(2)
        .toUpperCase()}${faker.string.numeric(4)}`,
      kmsDriven: faker.number.int({ min: 10000, max: 150000 }),
      ownerCount: faker.number.int({ min: 1, max: 4 }),
      insurance: faker.helpers.arrayElement([
        "Comprehensive",
        "Third Party",
        "None",
      ]),

      listedBy: "Dealer",
      badges: faker.helpers.arrayElements(
        ["BEST_SELLER", "RARE_FIND", "LOW_KMS"],
        { min: 1, max: 2 }
      ),
      vipNumber: faker.datatype.boolean(),
      city: faker.location.city(),
      state: faker.location.state(),

      brand,
      carUSP: faker.lorem.sentence(),
      carType: faker.helpers.arrayElement([
        "Sedan",
        "SUV",
        "Hatchback",
        "Coupe",
      ]),
      transmission: faker.helpers.arrayElement(["AUTOMATIC", "MANUAL"]),
      exteriorColour: faker.color.human(),
      peakTorque: `${faker.number.int({ min: 150, max: 400 })} Nm`,
      peakPower: `${faker.number.int({ min: 100, max: 300 })} bhp`,
      doors: faker.helpers.arrayElement([3, 5]),
      driveType: faker.helpers.arrayElement(["FWD", "RWD", "AWD"]),
      seatingCapacity: faker.helpers.arrayElement([4, 5, 7]),
      engine: `${faker.number.int({ min: 1000, max: 3000 })} cc`,
      fuelType: faker.helpers.arrayElement(["PETROL", "DIESEL", "ELECTRIC"]),
      mileage: parseFloat(
        faker.number.float({ min: 8, max: 25, precision: 0.1 })
      ),
      thumbnail: carImages[0],
      carImages: carImages,
    };

    await prisma.car.create({ data: carData });
  }

  console.log(`✅ Successfully created ${numberOfCars} car records.`);
}

main()
  .catch((e) => {
    console.error("💥 FAILED TO SEED DATABASE:", e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("👋 Seeding finished. Disconnecting Prisma Client.");
    await prisma.$disconnect();
  });
