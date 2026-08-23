const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API health check successful",
    service: "AI Complaint Management System",
    status: "running",
  });
});

module.exports = router;