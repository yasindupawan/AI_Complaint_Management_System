import { Routes, Route } from "react-router-dom";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

/* =========================================================
   CITIZEN PAGES
========================================================= */

import CitizenDashboard from "./pages/CitizenDashboard";
import NewComplaintPage from "./pages/NewComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";
import NotificationsPage from "./pages/NotificationsPage";

/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaintsPage from "./pages/AdminComplaintsPage";
import AdminComplaintDetailsPage from "./pages/AdminComplaintDetailsPage";

/* =========================================================
   APP ROUTES
========================================================= */

function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* =====================================================
          CITIZEN ROUTES
      ===================================================== */}

      <Route
        path="/dashboard"
        element={<CitizenDashboard />}
      />

      <Route
        path="/complaints/new"
        element={<NewComplaintPage />}
      />

      <Route
        path="/complaints"
        element={<MyComplaintsPage />}
      />

      <Route
        path="/complaints/:id"
        element={<ComplaintDetailsPage />}
      />

      <Route
        path="/notifications"
        element={<NotificationsPage />}
      />

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/complaints"
        element={<AdminComplaintsPage />}
      />

      <Route
        path="/admin/complaints/:id"
        element={<AdminComplaintDetailsPage />}
      />
    </Routes>
  );
}

export default App;