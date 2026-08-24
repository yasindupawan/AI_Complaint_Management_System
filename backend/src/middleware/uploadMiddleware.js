const multer = require("multer");

// =========================================================
// MULTER STORAGE
// =========================================================

// Store uploaded files temporarily in memory.
// Files will then be uploaded to Cloudinary.
const storage = multer.memoryStorage();


// =========================================================
// ALLOWED IMAGE TYPES
// =========================================================

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];


// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      ),
      false
    );
  }
};


// =========================================================
// MULTER CONFIGURATION
// =========================================================

const upload = multer({
  storage,

  limits: {
    // Maximum size per image = 5 MB
    fileSize:
      5 * 1024 * 1024,

    // Maximum number of files
    files: 5,
  },

  fileFilter,
});


// =========================================================
// COMPLAINT IMAGE UPLOAD
// =========================================================

// Postman / frontend field name:
// images
//
// Maximum:
// 5 images per complaint

const uploadComplaintImages =
  upload.array(
    "images",
    5
  );


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  uploadComplaintImages,
};