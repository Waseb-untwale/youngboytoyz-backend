require("dotenv").config();
const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const carRoutes = require('./routes/carRoutes')
const prisma = require('./utils/prisma')
app.use(express.json());
const bikeRoutes = require('./routes/bikeRoutes')
const authRoutes = require('./routes/authRoutes');


//db connection
async function testdbconnection(){
  try{
    await prisma.$connect();
    console.log("Database connected successfully")

  }
  catch(error){
   console.error("Database connection failed:",error);
   process.exit(1)
  }
}

app.use("/api/users", userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bikes", bikeRoutes);




const PORT = process.env.PORT || 4000;

app.listen(PORT, async() => {
  await testdbconnection()
  console.log(`Server running on port ${PORT}`);
});
