const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

// A simple slug creation function
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

async function main() {
  console.log("🌱 Starting the seeding process...");

  await prisma.car.deleteMany({});
  console.log("🗑️  Cleared previous car data.");

  const numberOfCars = 5000;

  for (let i = 0; i < numberOfCars; i++) {
    const brand = faker.vehicle.manufacturer();
    const model = faker.vehicle.model();
    const title = `${brand} ${model}`;
    const slug = createSlug(`${title}-${faker.string.alphanumeric(6)}`);
    const carImages = [
      faker.image.urlLoremFlickr({
        category: "transport",
        width: 1280,
        height: 720,
      }),
      faker.image.urlLoremFlickr({
        category: "transport",
        width: 1280,
        height: 720,
      }),
      faker.image.urlLoremFlickr({
        category: "transport",
        width: 1280,
        height: 720,
      }),
      faker.image.urlLoremFlickr({
        category: "transport",
        width: 1280,
        height: 720,
      }),
    ];

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

      // Other specs
      listedBy: "Dealer",
      badges: faker.helpers.arrayElements(
        ["BEST_SELLER", "RARE_FIND", "LOW_KMS"],
        { min: 1, max: 2 }
      ),
      vipNumber: faker.datatype.boolean(),
      city: faker.location.city(),
      state: faker.location.state(),

      // Car Details
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
