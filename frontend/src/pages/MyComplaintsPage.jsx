import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  ChevronRight,
  Plus,
} from "lucide-react";

import { getMyComplaints } from "../api/complaintService";

/* =========================================================
   HELPERS
========================================================= */

const formatCategory = (category) => {
  if (!category) return "Uncategorized";

  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatStatus = (status) => {
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
      return status || "Unknown";
  }
};

const formatPriority = (priority) => {
  if (!priority) return "Unknown";

  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1).toLowerCase()
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

/* =========================================================
   STATUS STYLE
========================================================= */

const getStatusStyle = (status) => {
  switch (status) {
    case "resolved":
      return "bg-emerald-50 text-emerald-700";

    case "in_progress":
      return "bg-amber-50 text-amber-700";

    case "assigned":
      return "bg-[#E8F6F4] text-[#176D72]";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "duplicate":
      return "bg-[#EDF5F5] text-[#176D72]";

    default:
      return "bg-[#EAF3F8] text-[#1F5F8B]";
  }
};

/* =========================================================
   PRIORITY STYLE
========================================================= */

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
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
   MY COMPLAINTS PAGE
========================================================= */

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  /* =========================================================
     LOAD COMPLAINTS
  ========================================================= */

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          setError(
            "Authentication token not found. Please login again."
          );

          setLoading(false);
          return;
        }

        const data = await getMyComplaints(token);

        setComplaints(
          Array.isArray(data.complaints)
            ? data.complaints
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load your complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  /* =========================================================
     CATEGORY LIST
  ========================================================= */

  const categories = useMemo(() => {
    return [
      ...new Set(
        complaints
          .map((complaint) => complaint.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [complaints]);

  /* =========================================================
     FILTER COMPLAINTS
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const title =
        complaint.title?.toLowerCase() || "";

      const description =
        complaint.description?.toLowerCase() || "";

      const complaintId =
        complaint._id?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        complaintId.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        complaint.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        complaint.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    complaints,
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold text-[#1B8A8F]">
              Citizen Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
              My Complaints
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#60798C] sm:text-base">
              View your submitted complaints and track
              their current processing status.
            </p>
          </div>

          <Link
            to="/complaints/new"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3 font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72]"
          >
            <Plus size={19} />
            New Complaint
          </Link>
        </section>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        {!loading && !error && (
          <section className="mt-8 rounded-2xl border border-[#D8E5EC] bg-white px-6 py-5 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                  <FileText size={21} />
                </div>

                <div>

                  <p className="text-sm text-[#60798C]">
                    Total Complaints
                  </p>

                  <p className="text-2xl font-extrabold text-[#16324A]">
                    {complaints.length}
                  </p>

                </div>

              </div>

              <p className="text-sm text-[#60798C]">
                Showing{" "}
                <span className="font-bold text-[#16324A]">
                  {filteredComplaints.length}
                </span>{" "}
                complaint
                {filteredComplaints.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          </section>
        )}

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm">

          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search complaints..."
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
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3 pl-11 pr-4 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="submitted">
                  Submitted
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

                <option value="rejected">
                  Rejected
                </option>

                <option value="duplicate">
                  Duplicate
                </option>
              </select>

            </div>

            {/* CATEGORY FILTER */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {formatCategory(category)}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#D8E5EC] bg-white shadow-sm">

            <div className="text-center">

              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#1F5F8B]"
              />

              <p className="mt-3 text-sm font-semibold text-[#60798C]">
                Loading your complaints...
              </p>

            </div>

          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>

                <p className="font-bold text-red-700">
                  Unable to load complaints
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          filteredComplaints.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#D8E5EC] bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#1F5F8B]">
                <FileText size={27} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#16324A]">
                No complaints found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#60798C]">
                No complaints match your current
                search or filter options.
              </p>

            </div>
          )}

        {/* =====================================================
            COMPLAINT LIST
        ===================================================== */}

        {!loading &&
          !error &&
          filteredComplaints.length > 0 && (
            <section className="mt-8 space-y-4">

              {filteredComplaints.map(
                (complaint) => (
                  <Link
                    key={complaint._id}
                    to={`/complaints/${complaint._id}`}
                    className="group block rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#8FC6CC] hover:shadow-lg hover:shadow-[#123B5D]/5 sm:p-6"
                  >

                    <div className="flex items-start justify-between gap-5">

                      {/* LEFT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

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
                            )}{" "}
                            Priority
                          </span>

                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#16324A] transition group-hover:text-[#1B8A8F]">
                          {complaint.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[#60798C]">
                          {complaint.description}
                        </p>

                        {/* INFORMATION */}

                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">

                          <div>

                            <span className="text-[#8A9EAC]">
                              Category:
                            </span>{" "}

                            <span className="font-semibold text-[#425D70]">
                              {formatCategory(
                                complaint.category
                              )}
                            </span>

                          </div>

                          <div className="flex items-center gap-1.5 text-[#60798C]">

                            <CalendarDays
                              size={15}
                              className="text-[#1B8A8F]"
                            />

                            {formatDate(
                              complaint.createdAt
                            )}

                          </div>

                        </div>

                        {/* ID */}

                        <p className="mt-4 break-all text-xs text-[#8A9EAC]">
                          Complaint ID:{" "}
                          {complaint._id}
                        </p>

                      </div>

                      {/* ARROW */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F9FB] text-[#8A9EAC] transition group-hover:bg-[#E8F6F4] group-hover:text-[#1B8A8F]">

                        <ChevronRight size={20} />

                      </div>

                    </div>

                  </Link>
                )
              )}

            </section>
          )}

      </main>
    </div>
  );
}

export default MyComplaintsPage;