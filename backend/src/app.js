const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(helmet());
app.use(cors());

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  morgan("dev")
);


// =========================================================
// API ROUTES
// =========================================================

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/complaints",
  complaintRoutes
);

app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


// =========================================================
// ROOT TEST ROUTE
// =========================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "AI Complaint Management System API is running",
    });
  }
);


// =========================================================
// ERROR HANDLING
// =========================================================

app.use(notFound);
app.use(errorHandler);


// =========================================================
// EXPORT
// =========================================================

module.exports = app;