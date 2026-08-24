const {
  cloudinary,
  validateCloudinaryConfig,
} = require("../config/cloudinary");


// =========================================================
// UPLOAD BUFFER TO CLOUDINARY
// =========================================================

const uploadBufferToCloudinary = (
  fileBuffer,
  options = {}
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "ai-complaint-management/complaints",

            resource_type:
              "image",

            transformation: [
              {
                width: 1600,
                height: 1600,
                crop: "limit",
              },
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],

            ...options,
          },

          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve({
              url:
                result.secure_url,

              publicId:
                result.public_id,
            });
          }
        );

      uploadStream.end(
        fileBuffer
      );
    }
  );
};


// =========================================================
// UPLOAD COMPLAINT IMAGES
// =========================================================

const uploadComplaintImagesToCloudinary =
  async (files = []) => {
    validateCloudinaryConfig();

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return [];
    }

    const uploadPromises =
      files.map((file) =>
        uploadBufferToCloudinary(
          file.buffer
        )
      );

    const uploadedImages =
      await Promise.all(
        uploadPromises
      );

    return uploadedImages;
  };


// =========================================================
// DELETE IMAGE FROM CLOUDINARY
// =========================================================

const deleteImageFromCloudinary =
  async (publicId) => {
    validateCloudinaryConfig();

    if (!publicId) {
      return null;
    }

    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
        }
      );

    return result;
  };


// =========================================================
// DELETE MULTIPLE IMAGES
// =========================================================

const deleteMultipleImagesFromCloudinary =
  async (images = []) => {
    if (
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return [];
    }

    const publicIds =
      images
        .map(
          (image) =>
            image.publicId
        )
        .filter(Boolean);

    if (
      publicIds.length === 0
    ) {
      return [];
    }

    const deletePromises =
      publicIds.map(
        (publicId) =>
          deleteImageFromCloudinary(
            publicId
          )
      );

    return Promise.all(
      deletePromises
    );
  };


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  uploadBufferToCloudinary,
  uploadComplaintImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
};