const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email, password },
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed to create user" });
  }
};

exports.totalUsers = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    res.status(200).json({ totalUsers: totalUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
