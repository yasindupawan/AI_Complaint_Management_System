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

const getStatusStyle = (status) => {
  switch (status) {
    case "submitted":
      return "bg-blue-50 text-blue-700";
    case "assigned":
      return "bg-indigo-50 text-indigo-700";
    case "in_progress":
      return "bg-amber-50 text-amber-700";
    case "resolved":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "duplicate":
      return "bg-purple-50 text-purple-700";
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
        console.error("Admin complaints load error:", err);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        {/* HEADER */}

        <section className="mt-6">
          <p className="text-sm font-semibold text-blue-600">
            Administration Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Manage Complaints
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            Review citizen complaints, inspect AI predictions,
            identify possible duplicates and manage complaint
            processing.
          </p>
        </section>

        {/* SUMMARY */}

        {!loading && !error && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Complaints"
              value={complaints.length}
              icon={<FileText size={21} />}
              iconStyle="bg-blue-50 text-blue-600"
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
              iconStyle="bg-purple-50 text-purple-600"
            />
          </section>
        )}

        {/* FILTERS */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_200px_200px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search complaint, citizen or ID..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="duplicate">Duplicate</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={reviewFilter}
                onChange={(event) =>
                  setReviewFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">All Reviews</option>
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
            <p className="mt-4 text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredComplaints.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {complaints.length}
              </span>{" "}
              complaints
            </p>
          )}
        </section>

        {/* LOADING */}

        {loading && (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm font-semibold text-slate-600">
                Loading complaints...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

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

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredComplaints.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <FileText
                size={32}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-bold">
                No complaints found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                No complaints match the selected filters.
              </p>
            </div>
          )}

        {/* COMPLAINT LIST */}

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
                    className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0 flex-1">

                        {/* BADGES */}

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
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                              <Copy size={13} />
                              Potential Duplicate
                            </span>
                          )}
                        </div>

                        {/* TITLE */}

                        <h2 className="mt-4 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                          {complaint.title ||
                            "Untitled Complaint"}
                        </h2>

                        <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">
                          {complaint.description}
                        </p>

                        {/* INFORMATION */}

                        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <User size={15} />

                            <span>
                              {complaint.citizen
                                ?.fullName ||
                                "Unknown Citizen"}
                            </span>
                          </div>

                          <span className="font-semibold text-slate-700">
                            {formatCategory(
                              complaint.category
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <CalendarDays size={15} />

                            {formatDate(
                              complaint.createdAt
                            )}
                          </div>
                        </div>

                        <p className="mt-4 break-all text-xs text-slate-400">
                          Complaint ID: {complaintId}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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

export default AdminComplaintsPage;