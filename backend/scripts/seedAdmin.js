require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const adminEmail = "admin@complaintsystem.lk";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin account already exists");
      await mongoose.connection.close();
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Admin12345", salt);

    await User.create({
      fullName: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      preferredLanguage: "english",
      isActive: true,
    });

    console.log("Admin account created successfully");
    console.log(`Email: ${adminEmail}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Admin seed error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();