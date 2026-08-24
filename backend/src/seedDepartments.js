const path = require("path");

// =========================================================
// LOAD ENVIRONMENT VARIABLES
// =========================================================

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const Department = require("./models/Department");

// =========================================================
// CHECK MONGODB URI
// =========================================================

console.log(
  "MONGODB_URI loaded:",
  process.env.MONGODB_URI ? "YES" : "NO"
);

// =========================================================
// DEPARTMENT DATA
// =========================================================

const departments = [
  {
    name: "Road Development Department",
    code: "ROAD",
    description:
      "Handles road and street related public complaints.",
    categories: ["roads"],
    isActive: true,
  },

  {
    name: "Waste Management Department",
    code: "WASTE",
    description:
      "Handles garbage collection, waste disposal, and cleanliness related public complaints.",
    categories: ["garbage"],
    isActive: true,
  },

  {
    name: "Water Supply Department",
    code: "WATER",
    description:
      "Handles water supply, water quality, leakage, and related public complaints.",
    categories: ["water_supply"],
    isActive: true,
  },

  {
    name: "Electrical Services Department",
    code: "ELEC",
    description:
      "Handles electricity, street lighting, and electrical infrastructure related public complaints.",
    categories: ["electricity"],
    isActive: true,
  },

  {
    name: "Drainage and Sewerage Department",
    code: "DRAIN",
    description:
      "Handles drainage, sewerage, flooding, and wastewater related public complaints.",
    categories: ["drainage"],
    isActive: true,
  },

  {
    name: "Environmental Services Department",
    code: "ENV",
    description:
      "Handles environmental pollution and other environment related public complaints.",
    categories: ["environment"],
    isActive: true,
  },
];

// =========================================================
// SEED DEPARTMENTS
// =========================================================

const seedDepartments = async () => {
  try {
    // -----------------------------------------------------
    // Validate MongoDB configuration
    // -----------------------------------------------------

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI was not found in backend/.env"
      );
    }

    // -----------------------------------------------------
    // Connect to MongoDB
    // -----------------------------------------------------

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "\nMongoDB connected successfully."
    );

    console.log(
      "\n" + "=".repeat(60)
    );

    console.log(
      "SEEDING DEPARTMENTS"
    );

    console.log(
      "=".repeat(60)
    );

    // -----------------------------------------------------
    // CREATE OR UPDATE DEPARTMENTS
    // -----------------------------------------------------

    for (const departmentData of departments) {
      const department =
        await Department.findOneAndUpdate(
          {
            code: departmentData.code,
          },

          {
            $set: departmentData,
          },

          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

      console.log(
        `${department.code} -> ${department.name} -> ${department.categories.join(
          ", "
        )}`
      );
    }

    // -----------------------------------------------------
    // VERIFY SAVED DEPARTMENTS
    // -----------------------------------------------------

    const savedDepartments =
      await Department.find({
        isActive: true,
      }).sort({
        code: 1,
      });

    console.log(
      "\n" + "=".repeat(60)
    );

    console.log(
      "DEPARTMENTS READY"
    );

    console.log(
      "=".repeat(60)
    );

    console.log(
      `\nActive Departments: ${savedDepartments.length}`
    );

    console.log("");

    savedDepartments.forEach(
      (department) => {
        console.log(
          `${department.code} | ${department.name} | ${department.categories.join(
            ", "
          )}`
        );
      }
    );

    console.log(
      "\nDepartment seeding completed successfully."
    );
  } catch (error) {
    console.error(
      "\nDepartment seeding failed:"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;
  } finally {
    // -----------------------------------------------------
    // CLOSE DATABASE CONNECTION
    // -----------------------------------------------------

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.connection.close();

      console.log(
        "\nMongoDB connection closed."
      );
    }
  }
};

// =========================================================
// RUN SEEDER
// =========================================================

seedDepartments();