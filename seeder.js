const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const seedAdminUser = async () => {
  try {
    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: bcrypt.hashSync("root", 10),
      role: "admin",
    };

    await User.deleteOne({ email: adminUser.email });
    await User.create(adminUser);

    console.log("Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdminUser();
