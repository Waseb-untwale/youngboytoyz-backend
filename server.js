require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const prisma = require("./utils/prisma");
app.use(express.json());
const bikeRoutes = require("./routes/bikeRoutes");
const authRoutes = require("./routes/authRoutes");
const vehicleRoute = require("./routes/vehicleRoute");
const eventRoute = require("./routes/eventRoute");
const dealerRoute = require("./routes/dealerRoute");
const redis = require("./utils/redis");

app.use(cors());

//db connection
async function testdbconnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/api/v1/bikes", bikeRoutes);
app.use("/api/v1/vehicles", vehicleRoute);
app.use("/api/v1/events", eventRoute);
app.use("/api/v1/dealer", dealerRoute);

app.use((err, req, res, next) => {
  console.error("--- UNHANDLED ERROR ---", err); // Log the full error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await testdbconnection();
  console.log(`Server running on port ${PORT}`);
});
