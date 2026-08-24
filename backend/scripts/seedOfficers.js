require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src/models/User");
const Department = require("../src/models/Department");


// =========================================================
// OFFICER CONFIGURATION
// =========================================================

const OFFICERS = [
  {
    fullName: "Road Development Officer",
    email: "road.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "ROAD",
  },
  {
    fullName: "Waste Management Officer",
    email: "waste.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "WASTE",
  },
  {
    fullName: "Water Supply Officer",
    email: "water.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "WATER",
  },
  {
    fullName: "Electrical Services Officer",
    email: "electric.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "ELEC",
  },
  {
    fullName: "Drainage and Sewerage Officer",
    email: "drain.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "DRAIN",
  },
  {
    fullName: "Environmental Services Officer",
    email: "environment.officer@complaint.lk",
    password: "Officer@12345",
    departmentCode: "ENV",
  },
];


// =========================================================
// SEED OFFICERS
// =========================================================

const seedOfficers = async () => {
  try {
    console.log(
      "\n============================================================"
    );
    console.log("DEPARTMENT OFFICER SEEDING");
    console.log(
      "============================================================"
    );


    // -----------------------------------------------------
    // 1. Check environment variable
    // -----------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the .env file"
      );
    }


    // -----------------------------------------------------
    // 2. Connect MongoDB
    // -----------------------------------------------------

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "\nMongoDB connected successfully."
    );


    // -----------------------------------------------------
    // 3. Create / update officers
    // -----------------------------------------------------

    let createdCount = 0;
    let updatedCount = 0;

    for (const officerData of OFFICERS) {

      // Find active department
      const department =
        await Department.findOne({
          code: officerData.departmentCode,
          isActive: true,
        });

      if (!department) {
        console.log(
          `\nSKIPPED: Department ${officerData.departmentCode} not found.`
        );

        continue;
      }


      // Hash password
      const salt =
        await bcrypt.genSalt(12);

      const hashedPassword =
        await bcrypt.hash(
          officerData.password,
          salt
        );


      // Check existing user
      const existingOfficer =
        await User.findOne({
          email: officerData.email,
        });


      // ---------------------------------------------------
      // Update existing officer
      // ---------------------------------------------------

      if (existingOfficer) {
        existingOfficer.fullName =
          officerData.fullName;

        existingOfficer.password =
          hashedPassword;

        existingOfficer.role =
          "officer";

        existingOfficer.department =
          department._id;

        existingOfficer.preferredLanguage =
          "english";

        existingOfficer.isActive =
          true;

        await existingOfficer.save();

        updatedCount++;

        console.log(
          `\nUPDATED: ${officerData.fullName}`
        );

        console.log(
          `Email      : ${officerData.email}`
        );

        console.log(
          `Department : ${department.name}`
        );

        continue;
      }


      // ---------------------------------------------------
      // Create new officer
      // ---------------------------------------------------

      const officer =
        await User.create({
          fullName:
            officerData.fullName,

          email:
            officerData.email,

          password:
            hashedPassword,

          role:
            "officer",

          department:
            department._id,

          preferredLanguage:
            "english",

          isActive:
            true,
        });

      createdCount++;

      console.log(
        `\nCREATED: ${officer.fullName}`
      );

      console.log(
        `Officer ID : ${officer._id}`
      );

      console.log(
        `Email      : ${officer.email}`
      );

      console.log(
        `Department : ${department.name}`
      );
    }


    // -----------------------------------------------------
    // 4. Summary
    // -----------------------------------------------------

    console.log(
      "\n============================================================"
    );

    console.log(
      "OFFICER SEEDING COMPLETED"
    );

    console.log(
      "============================================================"
    );

    console.log(
      `\nCreated : ${createdCount}`
    );

    console.log(
      `Updated : ${updatedCount}`
    );

    console.log(
      `Total   : ${OFFICERS.length}`
    );

    console.log(
      "\nOfficer Login Password:"
    );

    console.log(
      "Officer@12345"
    );

  } catch (error) {

    console.error(
      "\n============================================================"
    );

    console.error(
      "OFFICER SEEDING FAILED"
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
    // 5. Close MongoDB connection
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
// RUN
// =========================================================

seedOfficers();