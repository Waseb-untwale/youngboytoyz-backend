require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const prisma = require("./utils/prisma");
const redis = require("./utils/redis");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const vehicleRoute = require("./routes/vehicleRoute");
const eventRoute = require("./routes/eventRoute");
const dealerRoute = require("./routes/dealerRoute");
const designerRoute = require("./routes/designerRoute");
const workshopRoute = require("./routes/workShopRoute");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// --- Route Handlers ---
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/api/v1/bikes", bikeRoutes);
app.use("/api/v1/vehicles", vehicleRoute);
app.use("/api/v1/events", eventRoute);
app.use("/api/v1/dealer", dealerRoute);
app.use("/api/v1/designer", designerRoute);
app.use("/api/v1/workshop", workshopRoute);

app.use((err, req, res, next) => {
  console.error("--- UNHANDLED ERROR ---", err);
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 4000;

const connectAndStart = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test Redis connection
    await redis.ping();
    console.log("✅ Redis connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to a service:", error);
    process.exit(1);
  }
};

connectAndStart();

process.on("SIGINT", async () => {
  console.log("🔌 Shutting down gracefully...");
  try {
    await prisma.$disconnect();
    console.log("Database disconnected.");
    await redis.quit();
    console.log("Redis disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
