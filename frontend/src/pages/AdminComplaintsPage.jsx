import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  BrainCircuit,
  Copy,
  User,
  CalendarDays,
} from "lucide-react";

import { getAllComplaints } from "../api/complaintApi";

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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   STATUS COLOURS
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
   ADMIN COMPLAINTS PAGE
========================================================= */

function AdminComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");

  /* =========================================================
     LOAD ALL COMPLAINTS
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
          navigate("/login");
          return;
        }

        const response = await getAllComplaints(token);

        setComplaints(
          Array.isArray(response?.complaints)
            ? response.complaints
            : []
        );
      } catch (err) {
        console.error(
          "Admin complaints load error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [navigate]);

  /* =========================================================
     CATEGORY OPTIONS
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
     FILTERED DATA
  ========================================================= */

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const searchableText = [
        complaint.title,
        complaint.description,
        complaint._id,
        complaint.citizen?.fullName,
        complaint.citizen?.email,
        complaint.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        complaint.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        complaint.category === categoryFilter;

      const requiresManualReview =
        Boolean(
          complaint.aiPrediction?.requiresManualReview
        );

      const isPotentialDuplicate =
        Boolean(
          complaint.duplicateInfo?.isPotentialDuplicate
        );

      let matchesReview = true;

      if (reviewFilter === "manual") {
        matchesReview = requiresManualReview;
      }

      if (reviewFilter === "duplicate") {
        matchesReview = isPotentialDuplicate;
      }

      if (reviewFilter === "normal") {
        matchesReview =
          !requiresManualReview &&
          !isPotentialDuplicate;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesReview
      );
    });
  }, [
    complaints,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    reviewFilter,
  ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const reviewCount = complaints.filter(
    (complaint) =>
      complaint.aiPrediction?.requiresManualReview ||
      complaint.duplicateInfo?.isPotentialDuplicate
  ).length;

  const duplicateCount = complaints.filter(
    (complaint) =>
      complaint.duplicateInfo?.isPotentialDuplicate
  ).length;

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
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft size={17} />

          Back to Admin Dashboard
        </Link>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6">
          <p className="text-sm font-semibold text-[#1B8A8F]">
            Administration Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
            Manage Complaints
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#60798C] sm:text-base">
            Review citizen complaints, inspect AI predictions,
            identify possible duplicates and manage complaint
            processing.
          </p>
        </section>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        {!loading && !error && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">

            <SummaryCard
              title="Total Complaints"
              value={complaints.length}
              icon={<FileText size={21} />}
              iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
            />

            <SummaryCard
              title="Requires Review"
              value={reviewCount}
              icon={<BrainCircuit size={21} />}
              iconStyle="bg-amber-50 text-amber-600"
            />

            <SummaryCard
              title="Potential Duplicates"
              value={duplicateCount}
              icon={<Copy size={21} />}
              iconStyle="bg-[#E8F6F4] text-[#1B8A8F]"
            />

          </section>
        )}

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm">

          <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_200px_200px]">

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
                placeholder="Search complaint, citizen or ID..."
                className="w-full rounded-xl border border-[#D8E5EC] bg-white py-3 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-[#D8E5EC] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
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

            {/* PRIORITY */}

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="rounded-xl border border-[#D8E5EC] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
            >
              <option value="all">
                All Priorities
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>
            </select>

            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-xl border border-[#D8E5EC] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
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

            {/* REVIEW FILTER */}

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
              />

              <select
                value={reviewFilter}
                onChange={(event) =>
                  setReviewFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#D8E5EC] bg-white py-3 pl-11 pr-4 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              >
                <option value="all">
                  All Reviews
                </option>

                <option value="manual">
                  Manual Review
                </option>

                <option value="duplicate">
                  Potential Duplicate
                </option>

                <option value="normal">
                  Normal Processing
                </option>
              </select>
            </div>

          </div>

          {!loading && !error && (
            <div className="mt-4 rounded-xl bg-[#F6F9FB] px-4 py-3">
              <p className="text-sm text-[#60798C]">
                Showing{" "}
                <span className="font-bold text-[#16324A]">
                  {filteredComplaints.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#16324A]">
                  {complaints.length}
                </span>{" "}
                complaints
              </p>
            </div>
          )}

        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#D8E5EC] bg-white">
            <div className="text-center">

              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#1F5F8B]"
              />

              <p className="mt-3 text-sm font-semibold text-[#60798C]">
                Loading complaints...
              </p>

            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex gap-3">

              <AlertCircle
                size={22}
                className="shrink-0 text-red-600"
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
            <div className="mt-8 rounded-2xl border border-[#D8E5EC] bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#8A9EAC]">
                <FileText size={30} />
              </div>

              <h2 className="mt-4 font-bold text-[#16324A]">
                No complaints found
              </h2>

              <p className="mt-2 text-sm text-[#60798C]">
                No complaints match the selected filters.
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

              {filteredComplaints.map((complaint) => {
                const complaintId =
                  complaint._id || complaint.id;

                const requiresManualReview =
                  Boolean(
                    complaint.aiPrediction
                      ?.requiresManualReview
                  );

                const isPotentialDuplicate =
                  Boolean(
                    complaint.duplicateInfo
                      ?.isPotentialDuplicate
                  );

                return (
                  <Link
                    key={complaintId}
                    to={`/admin/complaints/${complaintId}`}
                    className="group block rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#8FC6CC] hover:shadow-lg hover:shadow-[#123B5D]/5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-5">

                      <div className="min-w-0 flex-1">

                        {/* =================================================
                            BADGES
                        ================================================= */}

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
                            {formatPriority(
                              complaint.priority
                            )}{" "}
                            Priority
                          </span>

                          {requiresManualReview && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              <BrainCircuit size={13} />

                              Manual Review
                            </span>
                          )}

                          {isPotentialDuplicate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F6F4] px-3 py-1 text-xs font-bold text-[#176D72]">
                              <Copy size={13} />

                              Potential Duplicate
                            </span>
                          )}

                        </div>

                        {/* =================================================
                            TITLE
                        ================================================= */}

                        <h2 className="mt-4 text-lg font-bold text-[#16324A] transition group-hover:text-[#1B8A8F]">
                          {complaint.title ||
                            "Untitled Complaint"}
                        </h2>

                        <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-[#60798C]">
                          {complaint.description}
                        </p>

                        {/* =================================================
                            INFORMATION
                        ================================================= */}

                        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#60798C]">

                          <div className="flex items-center gap-2">
                            <User
                              size={15}
                              className="text-[#1B8A8F]"
                            />

                            <span>
                              {complaint.citizen
                                ?.fullName ||
                                "Unknown Citizen"}
                            </span>
                          </div>

                          <span className="font-semibold text-[#425D70]">
                            {formatCategory(
                              complaint.category
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-[#1B8A8F]"
                            />

                            {formatDate(
                              complaint.createdAt
                            )}
                          </div>

                        </div>

                        <p className="mt-4 break-all text-xs text-[#8A9EAC]">
                          Complaint ID: {complaintId}
                        </p>

                      </div>

                      {/* =================================================
                          ARROW
                      ================================================= */}

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F9FB] text-[#8A9EAC] transition group-hover:bg-[#E8F6F4] group-hover:text-[#1B8A8F]">
                        <ChevronRight size={20} />
                      </div>

                    </div>
                  </Link>
                );
              })}

            </section>
          )}

      </main>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  icon,
  iconStyle,
}) {
  return (
    <div className="rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm transition duration-200 hover:border-[#BFD9E6] hover:shadow-md">

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

export default AdminComplaintsPage;