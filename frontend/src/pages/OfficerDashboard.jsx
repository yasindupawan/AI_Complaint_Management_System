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
        return "bg-indigo-50 text-indigo-700";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
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

    return priority
      .charAt(0)
      .toUpperCase() +
      priority.slice(1);
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
        return "bg-slate-100 text-slate-600";
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link
            to="/officer/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BrainCircuit size={23} />
            </div>

            <div>
              <p className="font-bold text-slate-900">
                Public Complaint
              </p>

              <p className="text-xs font-medium text-blue-600">
                Officer Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 md:flex"
            >
              <Bell size={19} />
            </button>

            <div className="hidden border-l border-slate-200 pl-4 md:block">
              <p className="max-w-44 truncate text-sm font-bold">
                {officer.fullName}
              </p>

              <p className="max-w-44 truncate text-xs text-slate-500">
                {officer.email ||
                  "Complaint Officer"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
          <p className="text-sm font-semibold text-blue-600">
            Officer Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Officer Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
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
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={
              <UserCheck size={22} />
            }
            title="Waiting to Start"
            value={stats.assigned}
            iconStyle="bg-indigo-50 text-indigo-600"
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
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={23} />
              </div>

              <div>
                <h2 className="font-bold">
                  My Assigned Complaints
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View and process all complaints
                  assigned to your account.
                </p>
              </div>
            </div>

            <ChevronRight
              size={20}
              className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
            />
          </Link>
        </section>

        {/* =====================================================
            RECENT COMPLAINTS
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">
                Recent Assigned Complaints
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently assigned complaints
                requiring your attention.
              </p>
            </div>

            <Link
              to="/officer/complaints"
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm font-semibold text-slate-500">
              <Loader2
                size={20}
                className="animate-spin text-blue-600"
              />

              Loading assigned complaints...
            </div>
          )}

          {!loading &&
            recentComplaints.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={23} />
                </div>

                <p className="mt-4 font-bold text-slate-800">
                  No assigned complaints
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Complaints assigned to you will
                  appear here.
                </p>
              </div>
            )}

          {!loading &&
            recentComplaints.length > 0 && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <Link
                              to={`/officer/complaints/${complaint._id}`}
                              className="font-semibold text-slate-800 hover:text-blue-600"
                            >
                              {complaint.title}
                            </Link>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {complaint.citizen
                              ?.fullName || "-"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {formatCategory(
                              complaint.category
                            )}
                          </td>

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

                          <td className="px-6 py-5 text-sm text-slate-500">
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

          {!loading &&
            recentComplaints.length > 0 && (
              <div className="divide-y divide-slate-100 md:hidden">
                {recentComplaints.map(
                  (complaint) => (
                    <Link
                      key={complaint._id}
                      to={`/officer/complaints/${complaint._id}`}
                      className="block p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold">
                            {complaint.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {complaint.citizen
                              ?.fullName ||
                              "Citizen"}
                          </p>
                        </div>

                        <ChevronRight
                          size={18}
                          className="text-slate-400"
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

                      <p className="mt-3 text-xs text-slate-400">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <p className="text-3xl font-extrabold text-slate-900">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-600">
        {title}
      </p>
    </div>
  );
}

export default OfficerDashboard;