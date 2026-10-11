
require("dotenv").config();

const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const mongoose = require("mongoose");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const createAdmin = async () => {
  try {
    const email = "essenza.store.perfume@gmail.com";

    const password = await rl.question(
      "Enter a new password for the admin account: "
    );

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    await connectDB();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists. No changes made.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name: "ESSENZA Admin",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
};

createAdmin();
