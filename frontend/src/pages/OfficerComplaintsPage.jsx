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
        return "bg-[#E8F6F4] text-[#176D72]";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-[#F1F5F7] text-[#60798C]";
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
        return "bg-[#F1F5F7] text-[#60798C]";
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
      <div className="min-h-screen bg-[#F6F9FB]">

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-[#1F5F8B]"
            />

            <p className="mt-4 text-sm font-semibold text-[#60798C]">
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
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

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
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft size={17} />

          Back to Officer Dashboard
        </button>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mt-6">

          <p className="text-sm font-semibold text-[#1B8A8F]">
            Officer Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
            My Assigned Complaints
          </h1>

          <p className="mt-2 max-w-2xl text-[#60798C]">
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
            iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
          />

          <StatCard
            icon={
              <CircleDot
                size={22}
              />
            }
            title="Waiting to Start"
            value={waitingToStart}
            iconStyle="bg-[#E8F6F4] text-[#1B8A8F]"
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

        <section className="mt-8 rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
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
                className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              />

            </div>

            {/* STATUS FILTER */}

            <div className="relative">

              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
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
                className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3 pl-11 pr-4 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
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
              className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
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

          <div className="mt-4 rounded-xl bg-[#F6F9FB] px-4 py-3">

            <p className="text-sm text-[#60798C]">

              Showing{" "}

              <span className="font-bold text-[#16324A]">
                {
                  filteredComplaints.length
                }
              </span>{" "}

              of{" "}

              <span className="font-bold text-[#16324A]">
                {
                  complaints.length
                }
              </span>{" "}

              complaints

            </p>

          </div>

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

            <div className="rounded-2xl border border-[#D8E5EC] bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#1F5F8B]">

                <FileText
                  size={30}
                />

              </div>

              <p className="mt-4 font-bold text-[#16324A]">
                No complaints found
              </p>

              <p className="mt-1 text-sm text-[#60798C]">
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
                  className="group w-full rounded-2xl border border-[#D8E5EC] bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#8FC6CC] hover:shadow-lg hover:shadow-[#123B5D]/5"
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

                      <h2 className="mt-4 text-lg font-bold text-[#16324A] transition group-hover:text-[#1B8A8F]">
                        {
                          complaint.title
                        }
                      </h2>

                      {/* DESCRIPTION */}

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#60798C]">
                        {
                          complaint.description
                        }
                      </p>

                      {/* INFORMATION */}

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#60798C]">

                        <span className="inline-flex items-center gap-2">

                          <User
                            size={15}
                            className="text-[#1B8A8F]"
                          />

                          {complaint
                            .citizen
                            ?.fullName ||
                            "Unknown Citizen"}

                        </span>

                        <span className="font-semibold text-[#425D70]">

                          {formatCategory(
                            complaint.category
                          )}

                        </span>

                        <span className="inline-flex items-center gap-2">

                          <CalendarDays
                            size={15}
                            className="text-[#1F5F8B]"
                          />

                          {formatDate(
                            complaint.createdAt
                          )}

                        </span>

                      </div>

                      {/* ID */}

                      <p className="mt-4 break-all text-xs text-[#8A9EAC]">
                        Complaint ID:{" "}
                        {
                          complaint._id
                        }
                      </p>

                    </div>

                    {/* ARROW */}

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F9FB] text-[#8A9EAC] transition group-hover:bg-[#E8F6F4] group-hover:text-[#1B8A8F]">

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

export default OfficerComplaintsPage;