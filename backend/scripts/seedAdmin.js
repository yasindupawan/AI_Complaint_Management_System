require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");


// =========================================================
// ADMIN CONFIGURATION
// =========================================================

const ADMIN_EMAIL = "admin@complaint.lk";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_NAME = "System Administrator";


// =========================================================
// SEED ADMIN
// =========================================================

const seedAdmin = async () => {
  try {
    console.log(
      "\n============================================================"
    );

    console.log("ADMIN ACCOUNT SEEDING");

    console.log(
      "============================================================"
    );


    // -----------------------------------------------------
    // 1. CHECK ENVIRONMENT VARIABLE
    // -----------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the .env file"
      );
    }


    // -----------------------------------------------------
    // 2. CONNECT TO MONGODB
    // -----------------------------------------------------

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("\nMongoDB connected successfully.");


    // -----------------------------------------------------
    // 3. CHECK WHETHER ADMIN ALREADY EXISTS
    // -----------------------------------------------------

    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL,
    });


    // -----------------------------------------------------
    // 4. IF ADMIN EXISTS - UPDATE PASSWORD / SETTINGS
    // -----------------------------------------------------

    if (existingAdmin) {
      console.log(
        "\nExisting admin account found."
      );

      const salt = await bcrypt.genSalt(12);

      const hashedPassword = await bcrypt.hash(
        ADMIN_PASSWORD,
        salt
      );

      existingAdmin.fullName = ADMIN_NAME;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.department = null;
      existingAdmin.preferredLanguage = "english";
      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log(
        "\n============================================================"
      );

      console.log(
        "ADMIN ACCOUNT UPDATED SUCCESSFULLY"
      );

      console.log(
        "============================================================"
      );

      console.log(
        `\nAdmin ID : ${existingAdmin._id}`
      );

      console.log(
        `Name     : ${existingAdmin.fullName}`
      );

      console.log(
        `Email    : ${ADMIN_EMAIL}`
      );

      console.log(
        `Password : ${ADMIN_PASSWORD}`
      );

      console.log(
        `Role     : ${existingAdmin.role}`
      );

      return;
    }


    // -----------------------------------------------------
    // 5. HASH ADMIN PASSWORD
    // -----------------------------------------------------

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      salt
    );


    // -----------------------------------------------------
    // 6. CREATE NEW ADMIN ACCOUNT
    // -----------------------------------------------------

    const admin = await User.create({
      fullName: ADMIN_NAME,

      email: ADMIN_EMAIL,

      password: hashedPassword,

      role: "admin",

      department: null,

      preferredLanguage: "english",

      isActive: true,
    });


    // -----------------------------------------------------
    // 7. SUCCESS MESSAGE
    // -----------------------------------------------------

    console.log(
      "\n============================================================"
    );

    console.log(
      "ADMIN ACCOUNT CREATED SUCCESSFULLY"
    );

    console.log(
      "============================================================"
    );

    console.log(
      `\nAdmin ID : ${admin._id}`
    );

    console.log(
      `Name     : ${admin.fullName}`
    );

    console.log(
      `Email    : ${ADMIN_EMAIL}`
    );

    console.log(
      `Password : ${ADMIN_PASSWORD}`
    );

    console.log(
      `Role     : ${admin.role}`
    );
  } catch (error) {
    console.error(
      "\n============================================================"
    );

    console.error(
      "ADMIN SEEDING FAILED"
    );

    console.error(
      "============================================================"
    );

    console.error(
      "\nError:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    // -----------------------------------------------------
    // 8. CLOSE DATABASE CONNECTION
    // -----------------------------------------------------

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();
    }

    console.log(
      "\nMongoDB connection closed."
    );
  }
};


// =========================================================
// RUN SCRIPT
// =========================================================

seedAdmin();