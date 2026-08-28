const axios = require("axios");
const FormData = require("form-data");

const {
  validateCloudinaryConfig,
} = require("../config/cloudinary");

// =========================================================
// UPLOAD BUFFER TO CLOUDINARY USING BASIC AUTH
// =========================================================

const uploadBufferToCloudinary = async (
  fileBuffer
) => {
  validateCloudinaryConfig();

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  const formData =
    new FormData();

  // Image file
  formData.append(
    "file",
    fileBuffer,
    {
      filename: "complaint-image.jpg",
      contentType: "image/jpeg",
    }
  );

  // Cloudinary folder
  formData.append(
    "folder",
    "ai-complaint-management/complaints"
  );

  // Incoming transformation
  formData.append(
    "transformation",
    "c_limit,w_1600,h_1600/f_auto,q_auto"
  );

  try {
    const response =
      await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },

          auth: {
            username: apiKey,
            password: apiSecret,
          },

          maxContentLength:
            Infinity,

          maxBodyLength:
            Infinity,
        }
      );

    return {
      url:
        response.data.secure_url,

      publicId:
        response.data.public_id,
    };
  } catch (error) {
    console.error(
      "Cloudinary upload failed:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
        "Cloudinary image upload failed"
    );
  }
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

    return Promise.all(
      uploadPromises
    );
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

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

    try {
      const response =
        await axios.delete(
          `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
          {
            auth: {
              username: apiKey,
              password: apiSecret,
            },

            data: {
              public_ids: [
                publicId,
              ],
            },
          }
        );

      return response.data;
    } catch (error) {
      console.error(
        "Cloudinary delete failed:",
        error.response?.data ||
          error.message
      );

      throw new Error(
        error.response?.data?.error?.message ||
          "Cloudinary image deletion failed"
      );
    }
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

    return Promise.all(
      publicIds.map(
        (publicId) =>
          deleteImageFromCloudinary(
            publicId
          )
      )
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