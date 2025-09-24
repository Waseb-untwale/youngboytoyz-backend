const { z } = require("zod");
const validate = require("./Validator");

const VehicleStatus = z.enum(["AVAILABLE", "SOLD", "PENDING", "RESERVED"]);
const FuelType = z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG"]);
const CollectionType = z.enum(["YBT", "DESIGNER", "WORKSHOP", "TORQUE_TUNER"]);
const createBikeSchema = z.object({
  // --- Core Details ---
  title: z.string({ required_error: "Title is required." }).min(3),
  description: z.string().optional(),
  brand: z.string().optional(),
  bikeUSP: z.string().optional(),

  // --- Ownership & History ---
  registrationYear: z.coerce.number().int().min(1900),
  registrationNumber: z.string({
    required_error: "Registration number is required.",
  }),
  kmsDriven: z.coerce.number().int().min(0),
  ownerCount: z.coerce.number().int().positive().optional(),
  insurance: z.string().optional(),

  // --- Pricing ---
  ybtPrice: z.coerce
    .number({ required_error: "YBT price is required." })
    .positive(),
  sellingPrice: z.coerce.number().positive().optional(),
  cutOffPrice: z.coerce.number().positive().optional(),

  // --- Specifications ---
  badges: z.array(z.string()).default([]),
  specs: z.array(z.string()).default([]),
  engine: z.string().optional(),
  vipNumber: z.coerce.boolean().optional().default(false),

  // --- Categorization (with defaults from Prisma) ---
  collectionType: CollectionType.optional().default("YBT"),
  fuelType: FuelType.optional().default("PETROL"),
  status: VehicleStatus.optional().default("AVAILABLE"),

  // --- Relations ---
  dealerId: z.coerce
    .number({ required_error: "Dealer ID is required." })
    .int()
    .positive(),
});

module.exports = {
  validateCreateBike: validate(createBikeSchema),
};
