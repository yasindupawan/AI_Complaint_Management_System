const cloudinary = require("cloudinary").v2;

// =========================================================
// CLOUDINARY CONFIGURATION
// =========================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =========================================================
// VALIDATE CONFIGURATION
// =========================================================

const validateCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary environment variables are missing"
    );
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  cloudinary,
  validateCloudinaryConfig,
};