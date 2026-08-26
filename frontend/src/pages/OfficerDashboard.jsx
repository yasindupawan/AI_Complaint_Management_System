import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  BrainCircuit,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Bell,
  LogOut,
  UserCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";

import {
  getOfficerAssignedComplaints,
} from "../api/officerComplaintApi";

/* =========================================================
   OFFICER DASHBOARD
========================================================= */

function OfficerDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [officer, setOfficer] = useState({
    fullName: "Officer",
    email: "",
  });

  /* =========================================================
     TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD STORED USER
  ========================================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setOfficer({
          fullName:
            parsedUser?.fullName ||
            parsedUser?.name ||
            "Officer",

          email:
            parsedUser?.email || "",
        });
      } catch (error) {
        console.error(
          "Unable to parse stored officer:",
          error
        );
      }
    }
  }, []);

  /* =========================================================
     LOAD ASSIGNED COMPLAINTS
  ========================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response =
          await getOfficerAssignedComplaints(
            token
          );

        setComplaints(
          Array.isArray(response?.complaints)
            ? response.complaints
            : []
        );
      } catch (err) {
        console.error(
          "Officer dashboard loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load officer dashboard."
        );

        const message =
          err?.message
            ?.toLowerCase() || "";

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

    loadDashboard();
  }, [navigate]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = {
    total: complaints.length,

    assigned: complaints.filter(
      (complaint) =>
        complaint.status === "assigned"
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
     HELPERS
  ========================================================= */

  const formatStatus = (status) => {
    switch (status) {
      case "assigned":
        return "Assigned";

      case "in_progress":
        return "In Progress";

      case "resolved":
        return "Resolved";

      default:
        return status || "-";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "assigned":
        return "bg-[#E8F6F4] text-[#176D72]";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-[#F1F5F7] text-[#60798C]";
    }
  };

  const formatCategory = (category) => {
    if (!category) {
      return "-";
    }

    return category
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  };

  const formatPriority = (priority) => {
    if (!priority) {
      return "-";
    }

    return (
      priority
        .charAt(0)
        .toUpperCase() +
      priority.slice(1)
    );
  };

  const getPriorityStyle = (priority) => {
    switch (
      priority?.toLowerCase()
    ) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-amber-50 text-amber-700";

      case "low":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-[#F1F5F7] text-[#60798C]";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
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
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#D8E5EC] bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">

          <Link
            to="/officer/dashboard"
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
                Officer Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-[#D8E5EC] text-[#60798C] transition hover:border-[#8FC6CC] hover:bg-[#E8F6F4] hover:text-[#1B8A8F] md:flex"
            >
              <Bell size={19} />
            </button>

            <div className="hidden border-l border-[#D8E5EC] pl-4 md:block">

              <p className="max-w-44 truncate text-sm font-bold text-[#16324A]">
                {officer.fullName}
              </p>

              <p className="max-w-44 truncate text-xs text-[#60798C]">
                {officer.email ||
                  "Complaint Officer"}
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

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <div className="flex gap-3">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =====================================================
            TITLE
        ===================================================== */}

        <section>

          <p className="text-sm font-semibold text-[#1B8A8F]">
            Officer Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
            Officer Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#60798C] sm:text-base">
            Review complaints assigned to you,
            update their progress and complete
            complaint resolution.
          </p>

        </section>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={
              <FileText size={22} />
            }
            title="Assigned Complaints"
            value={stats.total}
            iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
          />

          <StatCard
            icon={
              <UserCheck size={22} />
            }
            title="Waiting to Start"
            value={stats.assigned}
            iconStyle="bg-[#E8F6F4] text-[#1B8A8F]"
          />

          <StatCard
            icon={
              <Clock3 size={22} />
            }
            title="In Progress"
            value={stats.inProgress}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={
              <CheckCircle2 size={22} />
            }
            title="Resolved"
            value={stats.resolved}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

        </section>

        {/* =====================================================
            QUICK ACTION
        ===================================================== */}

        <section className="mt-8">

          <Link
            to="/officer/complaints"
            className="group flex items-center justify-between rounded-2xl border border-[#D8E5EC] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#8FC6CC] hover:shadow-lg hover:shadow-[#123B5D]/5"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F] transition group-hover:bg-[#1B8A8F] group-hover:text-white">
                <FileText size={23} />
              </div>

              <div>

                <h2 className="font-bold text-[#16324A]">
                  My Assigned Complaints
                </h2>

                <p className="mt-1 text-sm text-[#60798C]">
                  View and process all complaints
                  assigned to your account.
                </p>

              </div>

            </div>

            <ChevronRight
              size={20}
              className="text-[#B7C8D3] transition group-hover:translate-x-1 group-hover:text-[#1B8A8F]"
            />

          </Link>

        </section>

        {/* =====================================================
            RECENT COMPLAINTS
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#D8E5EC] bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-[#D8E5EC] px-6 py-5">

            <div>

              <h2 className="text-lg font-bold text-[#16324A]">
                Recent Assigned Complaints
              </h2>

              <p className="mt-1 text-sm text-[#60798C]">
                Recently assigned complaints
                requiring your attention.
              </p>

            </div>

            <Link
              to="/officer/complaints"
              className="text-sm font-bold text-[#1B8A8F] transition hover:text-[#176D72]"
            >
              View All
            </Link>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm font-semibold text-[#60798C]">

              <Loader2
                size={20}
                className="animate-spin text-[#1F5F8B]"
              />

              Loading assigned complaints...

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            recentComplaints.length === 0 && (
              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                  <FileText size={23} />
                </div>

                <p className="mt-4 font-bold text-[#16324A]">
                  No assigned complaints
                </p>

                <p className="mt-1 text-sm text-[#60798C]">
                  Complaints assigned to you will
                  appear here.
                </p>

              </div>
            )}

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          {!loading &&
            recentComplaints.length > 0 && (
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
                      (complaint) => (
                        <tr
                          key={complaint._id}
                          className="border-b border-[#EDF3F6] transition last:border-b-0 hover:bg-[#F8FBFC]"
                        >

                          {/* COMPLAINT */}

                          <td className="px-6 py-5">

                            <Link
                              to={`/officer/complaints/${complaint._id}`}
                              className="font-semibold text-[#16324A] transition hover:text-[#1B8A8F]"
                            >
                              {complaint.title}
                            </Link>

                          </td>

                          {/* CITIZEN */}

                          <td className="px-6 py-5 text-sm text-[#60798C]">
                            {complaint.citizen
                              ?.fullName || "-"}
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
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                                complaint.priority
                              )}`}
                            >
                              {formatPriority(
                                complaint.priority
                              )}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                complaint.status
                              )}`}
                            >
                              {formatStatus(
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
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          {/* =================================================
              MOBILE LIST
          ================================================= */}

          {!loading &&
            recentComplaints.length > 0 && (
              <div className="divide-y divide-[#EDF3F6] md:hidden">

                {recentComplaints.map(
                  (complaint) => (

                    <Link
                      key={complaint._id}
                      to={`/officer/complaints/${complaint._id}`}
                      className="block p-5 transition hover:bg-[#F8FBFC]"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="font-bold text-[#16324A]">
                            {complaint.title}
                          </p>

                          <p className="mt-1 text-xs text-[#8A9EAC]">
                            {complaint.citizen
                              ?.fullName ||
                              "Citizen"}
                          </p>

                        </div>

                        <ChevronRight
                          size={18}
                          className="text-[#8A9EAC]"
                        />

                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {formatStatus(
                            complaint.status
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                            complaint.priority
                          )}`}
                        >
                          {formatPriority(
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

                  )
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

export default OfficerDashboard;