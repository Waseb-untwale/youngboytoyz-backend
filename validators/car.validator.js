const { z } = require("zod");

const validate = require("./Validator");

const VehicleStatus = z.enum(["AVAILABLE", "SOLD", "PENDING", "RESERVED"]);
const FuelType = z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG"]);
const DriveType = z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]);
const CollectionType = z.enum(["YBT", "DESIGNER", "WORKSHOP", "TORQUE_TUNER"]);
const Stage = z.enum(["STAGE1", "STAGE2", "STAGE3"]);

const createCarSchema = z
  .object({
    // --- Core Details ---
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z.string().optional(),
    // FIX: Use the VehicleStatus enum for strict validation
    status: VehicleStatus.optional(),

    // --- Collection & Dealer ---
    dealerId: z.coerce
      .number({ required_error: "Please select a dealer." })
      .int()
      .positive(),
    // FIX: Use the enum directly, don't call it as a function
    collectionType: CollectionType,
    designerId: z.coerce.number().int().positive().optional(),
    workshopId: z.coerce.number().int().positive().optional(),
    tuningStage: Stage.optional(), // FIX: Use the Stage enum

    // --- Pricing ---
    sellingPrice: z.coerce.number().positive(),
    cutOffPrice: z.coerce.number().positive(),
    ybtPrice: z.coerce.number().positive(),

    // --- Ownership & History ---
    registrationYear: z.coerce.number().int().min(1900),
    registrationNumber: z.string().nonempty("Registration number is required."),
    kmsDriven: z.coerce.number().int().min(0),
    insurance: z.string().optional(),
    manufactureYear: z.coerce.number().int().min(1900).optional(),
    ownerCount: z.coerce.number().int().min(1).optional(),

    // --- Car Specifications ---
    brand: z.string().optional(),
    // FIX: Use the FuelType enum (with correct casing) and don't call it
    fuelType: FuelType.default("PETROL"),
    badges: z.array(z.string()).default([]),
    vipNumber: z.coerce.boolean().optional().default(false),
    city: z.string().optional(),
    state: z.string().optional(),
    carUSP: z.string().optional(),
    carType: z.string().optional(),
    transmission: z.string().optional(),
    exteriorColour: z.string().optional(),
    peakTorque: z.string().optional(),
    peakPower: z.string().optional(),
    engine: z.string().optional(),
    // FIX: Use the DriveType enum
    driveType: DriveType.optional(),
    mileage: z.coerce.number().min(0).optional(),
    doors: z.coerce.number().int().positive().optional(),
    seatingCapacity: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.collectionType === "DESIGNER") {
        return !!data.designerId && !data.workshopId;
      }
      return true;
    },
    {
      message: "A Designer car must have a designer ID and no workshop ID.",
      path: ["designerId"],
    }
  )
  .refine(
    (data) => {
      if (data.collectionType === "WORKSHOP") {
        return !!data.workshopId && !data.designerId;
      }
      return true;
    },
    {
      message: "A Workshop car must have a workshop ID and no designer ID.",
      path: ["workshopId"],
    }
  );

module.exports = {
  validateCreateCar: validate(createCarSchema),
};
