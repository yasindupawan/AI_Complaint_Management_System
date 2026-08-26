import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Bell,
  LogOut,
  Menu,
  X,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useEffect, useState } from "react";

import { getAllAdminComplaints } from "../api/adminComplaintApi";

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD ADMIN COMPLAINTS
  ========================================================= */

  useEffect(() => {
    const loadAdminDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response =
          await getAllAdminComplaints(token);

        setComplaints(
          Array.isArray(response?.complaints)
            ? response.complaints
            : []
        );
      } catch (err) {
        console.error(
          "Admin dashboard loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load admin dashboard information."
        );

        const message =
          err?.message?.toLowerCase() || "";

        if (
          message.includes("token") ||
          message.includes("unauthorized") ||
          message.includes("not authorized")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdminDashboard();
  }, [navigate]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = {
    total: complaints.length,

    pending: complaints.filter((complaint) =>
      ["submitted", "assigned"].includes(
        complaint.status
      )
    ).length,

    inProgress: complaints.filter(
      (complaint) =>
        complaint.status === "in_progress"
    ).length,

    resolved: complaints.filter(
      (complaint) =>
        complaint.status === "resolved"
    ).length,
  };

  const recentComplaints =
    complaints.slice(0, 5);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================================
     STATUS LABEL
  ========================================================= */

  const getStatusLabel = (status) => {
    switch (status) {
      case "submitted":
        return "Submitted";

      case "assigned":
        return "Assigned";

      case "in_progress":
        return "In Progress";

      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      case "duplicate":
        return "Duplicate";

      default:
        return status || "-";
    }
  };

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case "submitted":
        return "bg-[#EAF3F8] text-[#1F5F8B]";

      case "assigned":
        return "bg-[#E8F6F4] text-[#1B8A8F]";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      case "duplicate":
        return "bg-[#EDF5F5] text-[#176D72]";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  /* =========================================================
     PRIORITY LABEL
  ========================================================= */

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "-";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1).toLowerCase()
    );
  };

  /* =========================================================
     PRIORITY STYLE
  ========================================================= */

  const getPriorityStyle = (priority) => {
    const normalized =
      priority?.toLowerCase() || "";

    switch (normalized) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-amber-50 text-amber-700";

      case "low":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  /* =========================================================
     CATEGORY FORMAT
  ========================================================= */

  const formatCategory = (category) => {
    if (!category) {
      return "-";
    }

    return category
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  };

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     SHORT COMPLAINT ID
  ========================================================= */

  const getComplaintId = (complaint) => {
    const id =
      complaint?._id ||
      complaint?.id;

    if (!id) {
      return "-";
    }

    return `CMP-${id
      .toString()
      .slice(-6)
      .toUpperCase()}`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#D8E5EC] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">

          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123B5D] text-white shadow-sm shadow-[#123B5D]/15">
              <BrainCircuit size={23} />
            </div>

            <div>
              <p className="font-bold text-[#16324A]">
                Public Complaint
              </p>

              <p className="text-xs font-medium text-[#1B8A8F]">
                Administration Portal
              </p>
            </div>
          </Link>

          {/* DESKTOP HEADER */}

          <div className="hidden items-center gap-3 md:flex">

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8E5EC] text-[#60798C] transition hover:border-[#8FC6CC] hover:bg-[#E8F6F4] hover:text-[#1B8A8F]"
            >
              <Bell size={19} />
            </button>

            <div className="border-l border-[#D8E5EC] pl-4">
              <p className="text-sm font-bold text-[#16324A]">
                Administrator
              </p>

              <p className="text-xs text-[#60798C]">
                System Admin
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#60798C] transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />
            </button>

          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-lg border border-[#D8E5EC] p-2 text-[#16324A] md:hidden"
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-[#D8E5EC] bg-white p-5 md:hidden">

            <div className="flex flex-col gap-3">

              <div className="rounded-lg bg-[#F6F9FB] px-4 py-3">
                <p className="text-sm font-bold text-[#16324A]">
                  Administrator
                </p>

                <p className="mt-1 text-xs text-[#60798C]">
                  System Admin
                </p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600"
              >
                Logout
              </button>

            </div>

          </div>
        )}

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            TITLE
        ===================================================== */}

        <section>
          <p className="text-sm font-semibold text-[#1B8A8F]">
            Administration Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-[#60798C]">
            Monitor complaints, manage
            departments and oversee complaint
            processing across the system.
          </p>
        </section>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<FileText size={22} />}
            title="Total Complaints"
            value={
              loading
                ? "..."
                : stats.total
            }
            iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
          />

          <StatCard
            icon={
              <AlertCircle size={22} />
            }
            title="Pending"
            value={
              loading
                ? "..."
                : stats.pending
            }
            iconStyle="bg-[#E8F6F4] text-[#1B8A8F]"
          />

          <StatCard
            icon={<Clock3 size={22} />}
            title="In Progress"
            value={
              loading
                ? "..."
                : stats.inProgress
            }
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={
              <CheckCircle2 size={22} />
            }
            title="Resolved"
            value={
              loading
                ? "..."
                : stats.resolved
            }
            iconStyle="bg-emerald-50 text-emerald-600"
          />

        </section>

        {/* =====================================================
            SYSTEM MANAGEMENT
        ===================================================== */}

        <section className="mt-8">

          <h2 className="text-lg font-bold text-[#16324A]">
            System Management
          </h2>

          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <ManagementCard
              icon={
                <FileText size={23} />
              }
              title="Manage Complaints"
              description="Review, assign and monitor submitted complaints."
              onClick={() =>
                navigate(
                  "/admin/complaints"
                )
              }
            />

            <ManagementCard
              icon={
                <Building2 size={23} />
              }
              title="Departments"
              description="Manage departments responsible for complaint processing."
              onClick={() =>
                navigate(
                  "/admin/departments"
                )
              }
            />

            <ManagementCard
              icon={<Users size={23} />}
              title="Users & Officers"
              description="Manage system users and complaint officers."
              onClick={() =>
                navigate(
                  "/admin/users"
                )
              }
            />

            <ManagementCard
              icon={
                <ShieldCheck size={23} />
              }
              title="System Overview"
              description="Monitor system activity and processing performance."
              onClick={() =>
                navigate(
                  "/admin/overview"
                )
              }
            />

          </div>
        </section>

        {/* =====================================================
            RECENT COMPLAINTS
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#D8E5EC] bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-[#D8E5EC] px-6 py-5">

            <div>
              <h2 className="text-lg font-bold text-[#16324A]">
                Recent Complaints
              </h2>

              <p className="mt-1 text-sm text-[#60798C]">
                Recently submitted complaints
                requiring administrative
                attention.
              </p>
            </div>

            {complaints.length > 0 && (
              <Link
                to="/admin/complaints"
                className="text-sm font-bold text-[#1B8A8F] transition hover:text-[#176D72]"
              >
                View All
              </Link>
            )}

          </div>

          {/* LOADING */}

          {loading && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                <LayoutDashboard size={23} />
              </div>

              <p className="mt-4 font-bold text-[#16324A]">
                Loading complaint
                information
              </p>

              <p className="mt-1 text-sm text-[#60798C]">
                Please wait while complaint
                data is loaded.
              </p>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            recentComplaints.length ===
              0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                  <FileText size={23} />
                </div>

                <p className="mt-4 font-bold text-[#16324A]">
                  No complaints found
                </p>

                <p className="mt-1 text-sm text-[#60798C]">
                  Submitted complaints will
                  appear here.
                </p>

              </div>
            )}

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          {!loading &&
            recentComplaints.length >
              0 && (
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b border-[#D8E5EC] bg-[#F6F9FB] text-xs uppercase tracking-wide text-[#60798C]">

                      <th className="px-6 py-4 font-semibold">
                        Complaint
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Citizen
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Category
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Priority
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {recentComplaints.map(
                      (complaint) => {
                        const complaintId =
                          complaint._id ||
                          complaint.id;

                        return (
                          <tr
                            key={
                              complaintId
                            }
                            className="border-b border-[#EDF3F6] transition last:border-b-0 hover:bg-[#F8FBFC]"
                          >

                            {/* COMPLAINT */}

                            <td className="px-6 py-5">

                              <Link
                                to={`/admin/complaints/${complaintId}`}
                                className="font-semibold text-[#16324A] transition hover:text-[#1B8A8F]"
                              >
                                {complaint.title ||
                                  "Untitled Complaint"}
                              </Link>

                              <p className="mt-1 text-xs text-[#8A9EAC]">
                                {getComplaintId(
                                  complaint
                                )}
                              </p>

                            </td>

                            {/* CITIZEN */}

                            <td className="px-6 py-5">

                              <p className="text-sm font-medium text-[#425D70]">
                                {complaint
                                  .citizen
                                  ?.fullName ||
                                  "-"}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-[#8A9EAC]">
                                {complaint
                                  .citizen
                                  ?.email ||
                                  ""}
                              </p>

                            </td>

                            {/* CATEGORY */}

                            <td className="px-6 py-5 text-sm text-[#60798C]">
                              {formatCategory(
                                complaint.category
                              )}
                            </td>

                            {/* PRIORITY */}

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                                  complaint.priority
                                )}`}
                              >
                                {getPriorityLabel(
                                  complaint.priority
                                )}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                  complaint.status
                                )}`}
                              >
                                {getStatusLabel(
                                  complaint.status
                                )}
                              </span>
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5 text-sm text-[#60798C]">
                              {formatDate(
                                complaint.createdAt
                              )}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          {/* =================================================
              MOBILE COMPLAINTS
          ================================================= */}

          {!loading &&
            recentComplaints.length >
              0 && (
              <div className="divide-y divide-[#EDF3F6] md:hidden">

                {recentComplaints.map(
                  (complaint) => {
                    const complaintId =
                      complaint._id ||
                      complaint.id;

                    return (
                      <Link
                        key={complaintId}
                        to={`/admin/complaints/${complaintId}`}
                        className="block p-5 transition hover:bg-[#F8FBFC]"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="truncate font-bold text-[#16324A]">
                              {complaint.title ||
                                "Untitled Complaint"}
                            </p>

                            <p className="mt-1 text-xs text-[#8A9EAC]">
                              {getComplaintId(
                                complaint
                              )}
                            </p>

                          </div>

                          <ChevronRight
                            size={18}
                            className="shrink-0 text-[#8A9EAC]"
                          />

                        </div>

                        <p className="mt-3 text-sm text-[#60798C]">
                          {complaint
                            .citizen
                            ?.fullName ||
                            "Unknown Citizen"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {getStatusLabel(
                              complaint.status
                            )}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                              complaint.priority
                            )}`}
                          >
                            {getPriorityLabel(
                              complaint.priority
                            )}
                          </span>

                        </div>

                        <p className="mt-3 text-xs text-[#8A9EAC]">
                          {formatCategory(
                            complaint.category
                          )}{" "}
                          ·{" "}
                          {formatDate(
                            complaint.createdAt
                          )}
                        </p>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  iconStyle,
}) {
  return (
    <div className="rounded-2xl border border-[#D8E5EC] bg-white p-6 shadow-sm transition duration-200 hover:border-[#BFD9E6] hover:shadow-md">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <p className="text-3xl font-extrabold text-[#16324A]">
          {value}
        </p>

      </div>

      <p className="mt-4 text-sm font-semibold text-[#60798C]">
        {title}
      </p>

    </div>
  );
}

/* =========================================================
   MANAGEMENT CARD
========================================================= */

function ManagementCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-[#D8E5EC] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8FC6CC] hover:shadow-lg hover:shadow-[#123B5D]/5"
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F] transition group-hover:bg-[#1B8A8F] group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-[#16324A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#60798C]">
        {description}
      </p>

    </button>
  );
}

export default AdminDashboard;