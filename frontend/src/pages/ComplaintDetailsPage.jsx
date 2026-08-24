import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  User,
  Building2,
  BrainCircuit,
  Copy,
  History,
} from "lucide-react";

import {
  getComplaintById,
  getComplaintHistory,
} from "../api/complaintApi";

/* =========================================================
   HELPERS
========================================================= */

const formatCategory = (category) => {
  if (!category) return "Not Available";

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
  if (!date) return "Not Available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not Available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const formatConfidence = (value) => {
  if (typeof value !== "number") {
    return "Not Available";
  }

  return `${Math.round(value * 100)}%`;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "resolved":
      return "bg-emerald-50 text-emerald-700";

    case "in_progress":
      return "bg-amber-50 text-amber-700";

    case "assigned":
      return "bg-indigo-50 text-indigo-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "duplicate":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-blue-50 text-blue-700";
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

const getHistoryIcon = (status) => {
  switch (status) {
    case "resolved":
      return <CheckCircle2 size={18} />;

    case "in_progress":
      return <Clock3 size={18} />;

    default:
      return <FileText size={18} />;
  }
};

/* =========================================================
   COMPLAINT DETAILS PAGE
========================================================= */

function ComplaintDetailsPage() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD COMPLAINT + HISTORY
  ========================================================= */

  useEffect(() => {
    const loadComplaintDetails = async () => {
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

          return;
        }

        const [
          complaintResponse,
          historyResponse,
        ] = await Promise.all([
          getComplaintById(id, token),
          getComplaintHistory(id, token),
        ]);

        setComplaint(
          complaintResponse?.complaint || null
        );

        setHistory(
          Array.isArray(historyResponse?.history)
            ? historyResponse.history
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load complaint details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaintDetails();
  }, [id]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2
              size={38}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 font-semibold text-slate-600">
              Loading complaint details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/complaints"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to My Complaints
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-3">
              <AlertCircle
                size={22}
                className="shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-bold text-red-700">
                  Unable to load complaint
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error ||
                    "Complaint information could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     LOCATION
  ========================================================= */

  const locationText =
    complaint.location?.address ||
    complaint.location?.name ||
    complaint.location?.formattedAddress ||
    complaint.location?.locationName ||
    (typeof complaint.location === "string"
      ? complaint.location
      : null) ||
    "Not Provided";

  /* =========================================================
     IMAGES
  ========================================================= */

  const images = Array.isArray(complaint.images)
    ? complaint.images
    : [];

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* BACK */}

        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to My Complaints
        </Link>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">

            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-600">
                Complaint Details
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {complaint.title}
              </h1>

              <p className="mt-3 max-w-4xl leading-7 text-slate-500">
                {complaint.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                    complaint.status
                  )}`}
                >
                  {formatStatus(complaint.status)}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPriorityStyle(
                    complaint.priority
                  )}`}
                >
                  {formatPriority(
                    complaint.priority
                  )}{" "}
                  Priority
                </span>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Complaint ID
              </p>

              <p className="mt-1 break-all text-sm font-bold text-slate-700">
                {complaint._id}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ===================================================
              LEFT COLUMN
          =================================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* BASIC INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold">
                Complaint Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <InfoItem
                  icon={<FileText size={19} />}
                  label="Category"
                  value={formatCategory(
                    complaint.category
                  )}
                />

                <InfoItem
                  icon={<CalendarDays size={19} />}
                  label="Submitted Date"
                  value={formatDate(
                    complaint.createdAt
                  )}
                />

                <InfoItem
                  icon={<MapPin size={19} />}
                  label="Location"
                  value={locationText}
                />

                <InfoItem
                  icon={<FileText size={19} />}
                  label="Submitted Language"
                  value={
                    complaint.submittedLanguage
                      ? formatCategory(
                          complaint.submittedLanguage
                        )
                      : "Not Available"
                  }
                />
              </div>
            </section>

            {/* =================================================
                IMAGES
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ImageIcon size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Supporting Images
                  </h2>

                  <p className="text-sm text-slate-500">
                    Images submitted with this complaint.
                  </p>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <ImageIcon
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    No supporting images were submitted.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {images.map((image, index) => {
                    const imageUrl =
                      image?.url ||
                      image?.secure_url ||
                      image?.imageUrl ||
                      image;

                    return (
                      <a
                        key={
                          image?.publicId ||
                          image?.public_id ||
                          imageUrl ||
                          index
                        }
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={imageUrl}
                          alt={`Complaint supporting evidence ${
                            index + 1
                          }`}
                          className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* =================================================
                STATUS HISTORY
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <History size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Complaint Tracking
                  </h2>

                  <p className="text-sm text-slate-500">
                    Follow the processing history of your
                    complaint.
                  </p>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">
                  No status history is available.
                </p>
              ) : (
                <div className="mt-7">

                  {history.map((item, index) => {
                    const isLast =
                      index === history.length - 1;

                    return (
                      <div
                        key={item._id || index}
                        className="relative flex gap-4"
                      >
                        {/* LINE */}

                        {!isLast && (
                          <div className="absolute left-5 top-10 h-full w-px bg-slate-200" />
                        )}

                        {/* ICON */}

                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isLast
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {getHistoryIcon(
                            item.newStatus
                          )}
                        </div>

                        {/* CONTENT */}

                        <div
                          className={`min-w-0 flex-1 ${
                            isLast
                              ? "pb-0"
                              : "pb-8"
                          }`}
                        >
                          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">

                            <p className="font-bold">
                              {formatStatus(
                                item.newStatus
                              )}
                            </p>

                            <p className="text-xs text-slate-400">
                              {formatDate(
                                item.createdAt
                              )}
                            </p>
                          </div>

                          {item.remarks && (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {item.remarks}
                            </p>
                          )}

                          {item.changedBy && (
                            <p className="mt-2 text-xs text-slate-400">
                              Updated by{" "}
                              <span className="font-semibold">
                                {item.changedBy
                                  .fullName ||
                                  "System"}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ===================================================
              RIGHT COLUMN
          =================================================== */}

          <div className="space-y-6">

            {/* PROCESSING */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="font-bold">
                Processing Information
              </h2>

              <div className="mt-5 space-y-5">

                <SideInfoItem
                  icon={<Building2 size={19} />}
                  label="Department"
                  value={
                    complaint.department?.name ||
                    "Not Assigned"
                  }
                />

                <SideInfoItem
                  icon={<User size={19} />}
                  label="Assigned Officer"
                  value={
                    complaint.assignedOfficer
                      ?.fullName ||
                    "Not Assigned"
                  }
                />

                <SideInfoItem
                  icon={<Clock3 size={19} />}
                  label="Current Status"
                  value={formatStatus(
                    complaint.status
                  )}
                />
              </div>
            </section>

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <h2 className="font-bold">
                    AI Analysis
                  </h2>

                  <p className="text-xs text-slate-500">
                    Automated complaint analysis
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">

                <DataRow
                  label="Predicted Category"
                  value={formatCategory(
                    complaint.category
                  )}
                />

                <DataRow
                  label="Category Confidence"
                  value={formatConfidence(
                    complaint.aiPrediction
                      ?.categoryConfidence
                  )}
                />

                <DataRow
                  label="Predicted Priority"
                  value={formatPriority(
                    complaint.priority
                  )}
                />

                <DataRow
                  label="Priority Confidence"
                  value={formatConfidence(
                    complaint.aiPrediction
                      ?.priorityConfidence
                  )}
                />

                <DataRow
                  label="Detected Language"
                  value={
                    complaint.aiPrediction
                      ?.detectedLanguage ||
                    "Not Available"
                  }
                />

                <DataRow
                  label="Manual Review"
                  value={
                    complaint.aiPrediction
                      ?.requiresManualReview
                      ? "Required"
                      : "Not Required"
                  }
                />
              </div>
            </section>

            {/* =================================================
                DUPLICATE CHECK
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Copy size={19} />
                </div>

                <h2 className="font-bold">
                  Duplicate Detection
                </h2>
              </div>

              <div className="mt-5 space-y-4">

                <DataRow
                  label="Potential Duplicate"
                  value={
                    complaint.duplicateInfo
                      ?.isPotentialDuplicate
                      ? "Yes"
                      : "No"
                  }
                />

                <DataRow
                  label="Similarity Score"
                  value={
                    typeof complaint
                      .duplicateInfo
                      ?.similarityScore ===
                    "number"
                      ? `${Math.round(
                          complaint
                            .duplicateInfo
                            .similarityScore *
                            100
                        )}%`
                      : "Not Available"
                  }
                />

                {complaint.duplicateInfo
                  ?.matchedComplaint && (
                  <div className="rounded-xl bg-purple-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                      Matched Complaint
                    </p>

                    <p className="mt-2 text-sm font-bold text-purple-800">
                      {complaint
                        .duplicateInfo
                        .matchedComplaint
                        .title ||
                        "Potential matching complaint"}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ADMIN REMARKS */}

            {complaint.adminRemarks && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">

                <h2 className="font-bold">
                  Processing Remarks
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {complaint.adminRemarks}
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">

      <div className="mt-0.5 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SIDE INFO ITEM
========================================================= */

function SideInfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DATA ROW
========================================================= */

function DataRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-right text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

export default ComplaintDetailsPage;