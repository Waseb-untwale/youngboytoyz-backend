const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
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

exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phoneNumber,
      DOB,
      gender,
      address,
      city,
      state,
      zipCode,
      country,
    } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (phoneNumber) dataToUpdate.phoneNumber = phoneNumber;
    if (address) dataToUpdate.address = address;
    if (city) dataToUpdate.city = city;
    if (state) dataToUpdate.state = state;
    if (zipCode) dataToUpdate.zipCode = zipCode;
    if (country) dataToUpdate.country = country;

    if (DOB) {
      const dobDate = new Date(DOB);
      if (isNaN(dobDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid Date of Birth format." });
      }
      dataToUpdate.DOB = dobDate.toISOString();
    }
    if (gender) {
      if (!["MALE", "FEMALE", "OTHER"].includes(gender.toUpperCase())) {
        return res.status(400).json({ message: "Invalid gender value." });
      }
      dataToUpdate.gender = gender.toUpperCase();
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res
        .status(400)
        .json({ message: "No fields to update were provided." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        DOB: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        role: true,
      },
    });

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res
      .status(500)
      .json({ message: "Server error while updating user details" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the current password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error while updating password." });
  }
};
