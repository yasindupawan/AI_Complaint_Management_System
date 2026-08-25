import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  User,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleDot,
  ChevronRight,
} from "lucide-react";

import {
  getOfficerAssignedComplaints,
} from "../api/officerComplaintApi";

/* =========================================================
   OFFICER COMPLAINTS PAGE
========================================================= */

function OfficerComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  /* =========================================================
     GET TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD ASSIGNED COMPLAINTS
  ========================================================= */

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login", {
            replace: true,
          });
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
          "Officer complaints loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load assigned complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [navigate]);

  /* =========================================================
     FILTER COMPLAINTS
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase();

    return complaints.filter(
      (complaint) => {
        const title =
          complaint.title || "";

        const description =
          complaint.description || "";

        const citizenName =
          complaint.citizen
            ?.fullName || "";

        const complaintId =
          complaint._id || "";

        const matchesSearch =
          !normalizedSearch ||
          title
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          description
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          citizenName
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          complaintId
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        const matchesStatus =
          statusFilter === "all" ||
          complaint.status ===
            statusFilter;

        const matchesPriority =
          priorityFilter === "all" ||
          complaint.priority ===
            priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      }
    );
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  /* =========================================================
     DASHBOARD COUNTS
  ========================================================= */

  const totalAssigned =
    complaints.length;

  const waitingToStart =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "assigned"
    ).length;

  const inProgress =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "in_progress"
    ).length;

  const resolved =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "resolved"
    ).length;

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatStatus = (
    status
  ) => {
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

  const getStatusStyle = (
    status
  ) => {
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

  const getPriorityStyle = (
    priority
  ) => {
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

  const formatCategory = (
    category
  ) => {
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

  const formatDate = (
    date
  ) => {
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
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading assigned complaints...
            </p>

          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* =====================================================
            BACK
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/officer/dashboard"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />

          Back to Officer Dashboard
        </button>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mt-6">

          <p className="text-sm font-semibold text-blue-600">
            Officer Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            My Assigned Complaints
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Review complaints assigned to your account,
            monitor their progress and continue complaint
            resolution.
          </p>

        </section>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={
              <FileText
                size={22}
              />
            }
            title="Assigned Complaints"
            value={totalAssigned}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={
              <CircleDot
                size={22}
              />
            }
            title="Waiting to Start"
            value={waitingToStart}
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={
              <Clock3
                size={22}
              />
            }
            title="In Progress"
            value={inProgress}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={
              <CheckCircle2
                size={22}
              />
            }
            title="Resolved"
            value={resolved}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  searchTerm
                }
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search complaint, citizen or ID..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            {/* STATUS FILTER */}

            <div className="relative">

              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

              </select>

            </div>

            {/* PRIORITY FILTER */}

            <select
              value={
                priorityFilter
              }
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">
                All Priorities
              </option>

              <option value="high">
                High Priority
              </option>

              <option value="medium">
                Medium Priority
              </option>

              <option value="low">
                Low Priority
              </option>

            </select>

          </div>

          <p className="mt-4 text-sm text-slate-500">

            Showing{" "}

            <span className="font-bold text-slate-900">
              {
                filteredComplaints.length
              }
            </span>{" "}

            of{" "}

            <span className="font-bold text-slate-900">
              {
                complaints.length
              }
            </span>{" "}

            complaints

          </p>

        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex gap-3">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

            </div>

          </div>

        )}

        {/* =====================================================
            COMPLAINTS
        ===================================================== */}

        <section className="mt-8 space-y-4">

          {filteredComplaints.length ===
          0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <FileText
                size={38}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-800">
                No complaints found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No assigned complaints match the current filters.
              </p>

            </div>

          ) : (

            filteredComplaints.map(
              (complaint) => (

                <button
                  key={
                    complaint._id
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/officer/complaints/${complaint._id}`
                    )
                  }
                  className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-5">

                    <div className="min-w-0 flex-1">

                      {/* STATUS + PRIORITY */}

                      <div className="flex flex-wrap gap-2">

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
                          {complaint.priority
                            ? `${complaint.priority
                                .charAt(0)
                                .toUpperCase()}${complaint.priority.slice(
                                1
                              )} Priority`
                            : "Priority Unknown"}
                        </span>

                      </div>

                      {/* TITLE */}

                      <h2 className="mt-4 text-lg font-bold text-slate-900">
                        {
                          complaint.title
                        }
                      </h2>

                      {/* DESCRIPTION */}

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {
                          complaint.description
                        }
                      </p>

                      {/* INFORMATION */}

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">

                        <span className="inline-flex items-center gap-2">

                          <User
                            size={15}
                          />

                          {complaint
                            .citizen
                            ?.fullName ||
                            "Unknown Citizen"}

                        </span>

                        <span className="font-medium text-slate-700">

                          {formatCategory(
                            complaint.category
                          )}

                        </span>

                        <span className="inline-flex items-center gap-2">

                          <CalendarDays
                            size={15}
                          />

                          {formatDate(
                            complaint.createdAt
                          )}

                        </span>

                      </div>

                      {/* ID */}

                      <p className="mt-4 break-all text-xs text-slate-400">
                        Complaint ID:{" "}
                        {
                          complaint._id
                        }
                      </p>

                    </div>

                    {/* ARROW */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">

                      <ChevronRight
                        size={19}
                      />

                    </div>

                  </div>

                </button>

              )
            )

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

        <p className="text-3xl font-extrabold">
          {value}
        </p>

      </div>

      <p className="mt-4 text-sm font-semibold text-slate-600">
        {title}
      </p>

    </div>
  );
}

export default OfficerComplaintsPage;