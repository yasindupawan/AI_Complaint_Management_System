import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import {
  ArrowLeft,
  FileText,
  User,
  Mail,
  Languages,
  MapPin,
  Building2,
  UserCheck,
  BrainCircuit,
  Copy,
  CalendarDays,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
  XCircle,
  RefreshCw,
  History,
  Clock3,
  ArrowRight,
} from "lucide-react";

import {
  getAdminComplaintById,
  getAdminComplaintHistory,
  assignAdminComplaint,
  confirmAdminDuplicate,
  rejectAdminDuplicateFlag,
  updateAdminComplaintStatus,
} from "../api/adminComplaintApi";

import {
  getDepartments,
  getOfficersByDepartment,
} from "../api/departmentApi";

/* =========================================================
   ADMIN COMPLAINT DETAILS PAGE
========================================================= */

function AdminComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     STATUS HISTORY STATES
  ========================================================= */

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  /* =========================================================
     ASSIGNMENT STATES
  ========================================================= */

  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedOfficer, setSelectedOfficer] =
    useState("");

  const [assignmentRemarks, setAssignmentRemarks] =
    useState("");

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const [loadingOfficers, setLoadingOfficers] =
    useState(false);

  const [assigning, setAssigning] = useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("");

  /* =========================================================
     DUPLICATE REVIEW STATES
  ========================================================= */

  const [duplicateRemarks, setDuplicateRemarks] =
    useState("");

  const [
    duplicateReviewLoading,
    setDuplicateReviewLoading,
  ] = useState(false);

  const [
    duplicateReviewError,
    setDuplicateReviewError,
  ] = useState("");

  const [
    duplicateReviewSuccess,
    setDuplicateReviewSuccess,
  ] = useState("");

  /* =========================================================
     STATUS UPDATE STATES
  ========================================================= */

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [statusRemarks, setStatusRemarks] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusUpdateError, setStatusUpdateError] =
    useState("");

  const [statusUpdateSuccess, setStatusUpdateSuccess] =
    useState("");

  /* =========================================================
     GET TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await getAdminComplaintById(
        id,
        token
      );

      const loadedComplaint =
        response?.complaint || null;

      setComplaint(loadedComplaint);

      setSelectedStatus(
        loadedComplaint?.status || ""
      );

      if (loadedComplaint?.department?._id) {
        setSelectedDepartment(
          loadedComplaint.department._id
        );
      } else {
        setSelectedDepartment("");
      }

      if (loadedComplaint?.assignedOfficer?._id) {
        setSelectedOfficer(
          loadedComplaint.assignedOfficer._id
        );
      } else {
        setSelectedOfficer("");
      }
    } catch (err) {
      console.error(
        "Admin complaint details error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load complaint details."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD STATUS HISTORY
  ========================================================= */

  const loadComplaintHistory = async () => {
    try {
      setLoadingHistory(true);
      setHistoryError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await getAdminComplaintHistory(
          id,
          token
        );

      setHistory(
        Array.isArray(response?.history)
          ? response.history
          : []
      );
    } catch (err) {
      console.error(
        "Admin complaint history error:",
        err
      );

      setHistory([]);

      setHistoryError(
        err?.message ||
          "Unable to load complaint status history."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (id) {
      loadComplaint();
      loadComplaintHistory();
    }
  }, [id]);

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response =
          await getDepartments(token);

        setDepartments(
          Array.isArray(response?.departments)
            ? response.departments
            : []
        );
      } catch (err) {
        console.error(
          "Department loading error:",
          err
        );

        setAssignmentError(
          err?.message ||
            "Unable to load departments."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [navigate]);

  /* =========================================================
     LOAD OFFICERS WHEN DEPARTMENT CHANGES
  ========================================================= */

  useEffect(() => {
    const loadOfficers = async () => {
      if (!selectedDepartment) {
        setOfficers([]);
        setSelectedOfficer("");
        return;
      }

      try {
        setLoadingOfficers(true);
        setAssignmentError("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response =
          await getOfficersByDepartment(
            selectedDepartment,
            token
          );

        const loadedOfficers =
          Array.isArray(response?.officers)
            ? response.officers
            : [];

        setOfficers(loadedOfficers);

        const existingOfficerId =
          complaint?.assignedOfficer?._id;

        if (
          existingOfficerId &&
          loadedOfficers.some(
            (officer) =>
              officer._id === existingOfficerId
          )
        ) {
          setSelectedOfficer(existingOfficerId);
        } else {
          setSelectedOfficer("");
        }
      } catch (err) {
        console.error(
          "Officer loading error:",
          err
        );

        setOfficers([]);
        setSelectedOfficer("");

        setAssignmentError(
          err?.message ||
            "Unable to load officers."
        );
      } finally {
        setLoadingOfficers(false);
      }
    };

    loadOfficers();
  }, [
    selectedDepartment,
    complaint?.assignedOfficer?._id,
    navigate,
  ]);

  /* =========================================================
     REFRESH COMPLAINT + HISTORY
  ========================================================= */

  const refreshComplaintData = async () => {
    await Promise.all([
      loadComplaint(),
      loadComplaintHistory(),
    ]);
  };

  /* =========================================================
     ASSIGN / REASSIGN COMPLAINT
  ========================================================= */

  const handleAssignComplaint = async (event) => {
    event.preventDefault();

    try {
      setAssignmentError("");
      setAssignmentSuccess("");

      if (
        complaint?.duplicateInfo
          ?.isPotentialDuplicate
      ) {
        setAssignmentError(
          "Review the potential duplicate before assigning this complaint."
        );
        return;
      }

      if (complaint?.status === "duplicate") {
        setAssignmentError(
          "A confirmed duplicate complaint cannot be assigned."
        );
        return;
      }

      if (!selectedDepartment) {
        setAssignmentError(
          "Please select a department."
        );
        return;
      }

      if (!selectedOfficer) {
        setAssignmentError(
          "Please select an officer."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      setAssigning(true);

      const response =
        await assignAdminComplaint(
          id,
          {
            department: selectedDepartment,
            officer: selectedOfficer,
            remarks: assignmentRemarks.trim(),
          },
          token
        );

      setAssignmentSuccess(
        response?.message ||
          "Complaint assigned successfully."
      );

      setAssignmentRemarks("");

      await refreshComplaintData();
    } catch (err) {
      console.error(
        "Complaint assignment error:",
        err
      );

      setAssignmentError(
        err?.message ||
          "Unable to assign complaint."
      );
    } finally {
      setAssigning(false);
    }
  };

  /* =========================================================
     CONFIRM DUPLICATE
  ========================================================= */

  const handleConfirmDuplicate = async () => {
    try {
      setDuplicateReviewError("");
      setDuplicateReviewSuccess("");
      setDuplicateReviewLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await confirmAdminDuplicate(
          id,
          duplicateRemarks.trim(),
          token
        );

      setDuplicateReviewSuccess(
        response?.message ||
          "Complaint confirmed as duplicate successfully."
      );

      setDuplicateRemarks("");

      setAssignmentError("");
      setAssignmentSuccess("");

      setStatusUpdateError("");
      setStatusUpdateSuccess("");

      await refreshComplaintData();
    } catch (err) {
      console.error(
        "Confirm duplicate error:",
        err
      );

      setDuplicateReviewError(
        err?.message ||
          "Unable to confirm duplicate complaint."
      );
    } finally {
      setDuplicateReviewLoading(false);
    }
  };

  /* =========================================================
     REJECT DUPLICATE FLAG
  ========================================================= */

  const handleRejectDuplicate = async () => {
    try {
      setDuplicateReviewError("");
      setDuplicateReviewSuccess("");
      setDuplicateReviewLoading(true);

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await rejectAdminDuplicateFlag(
          id,
          duplicateRemarks.trim(),
          token
        );

      setDuplicateReviewSuccess(
        response?.message ||
          "Duplicate flag rejected successfully."
      );

      setDuplicateRemarks("");

      await refreshComplaintData();
    } catch (err) {
      console.error(
        "Reject duplicate flag error:",
        err
      );

      setDuplicateReviewError(
        err?.message ||
          "Unable to reject duplicate flag."
      );
    } finally {
      setDuplicateReviewLoading(false);
    }
  };

  /* =========================================================
     UPDATE COMPLAINT STATUS
  ========================================================= */

  const handleUpdateStatus = async (event) => {
    event.preventDefault();

    try {
      setStatusUpdateError("");
      setStatusUpdateSuccess("");

      if (!selectedStatus) {
        setStatusUpdateError(
          "Please select a status."
        );
        return;
      }

      if (
        complaint?.duplicateInfo
          ?.isPotentialDuplicate
      ) {
        setStatusUpdateError(
          "Review the potential duplicate before updating the normal complaint status."
        );
        return;
      }

      if (complaint?.status === "duplicate") {
        setStatusUpdateError(
          "A confirmed duplicate complaint cannot continue through the normal processing workflow."
        );
        return;
      }

      if (
        selectedStatus === complaint.status
      ) {
        setStatusUpdateError(
          "Please select a different status."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      setUpdatingStatus(true);

      const response =
        await updateAdminComplaintStatus(
          id,
          {
            status: selectedStatus,
            remarks: statusRemarks.trim(),
          },
          token
        );

      setStatusUpdateSuccess(
        response?.message ||
          "Complaint status updated successfully."
      );

      setStatusRemarks("");

      await refreshComplaintData();
    } catch (err) {
      console.error(
        "Complaint status update error:",
        err
      );

      setStatusUpdateError(
        err?.message ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

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
        return status || "-";
    }
  };

  /*
   * Important:
   * Semantic status colours remain different.
   * This makes status identification clear while the
   * overall application uses the new Smart City palette.
   */
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

  const getHistoryDotStyle = (status) => {
    switch (status) {
      case "submitted":
        return "bg-[#1F5F8B]";

      case "assigned":
        return "bg-[#1B8A8F]";

      case "in_progress":
        return "bg-amber-500";

      case "resolved":
        return "bg-emerald-600";

      case "rejected":
        return "bg-red-600";

      case "duplicate":
        return "bg-[#176D72]";

      default:
        return "bg-slate-400";
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

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatConfidence = (confidence) => {
    if (typeof confidence !== "number") {
      return "-";
    }

    return `${(
      confidence * 100
    ).toFixed(1)}%`;
  };

  const formatRole = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";

      case "officer":
        return "Officer";

      case "citizen":
        return "Citizen";

      default:
        return role || "System User";
    }
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
      <div className="min-h-screen bg-[#F6F9FB]">
        <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/complaints")
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
          >
            <ArrowLeft size={17} />

            Back to Complaints
          </button>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-3">
              <AlertCircle
                size={22}
                className="shrink-0 text-red-600"
              />

              <div>
                <p className="font-bold text-red-700">
                  Unable to load complaint
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error ||
                    "Complaint not found."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

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

  const matchedComplaint =
    complaint.duplicateInfo
      ?.matchedComplaint;

  const images =
    Array.isArray(complaint.images)
      ? complaint.images
      : [];

  const duplicateAlreadyConfirmed =
    complaint.status === "duplicate";

  const terminalStatus = [
    "resolved",
    "rejected",
    "duplicate",
  ].includes(complaint.status);

  const canAssign =
    !isPotentialDuplicate &&
    !terminalStatus;

  const canUpdateStatus =
    !isPotentialDuplicate &&
    !duplicateAlreadyConfirmed;

  /* =========================================================
     LOCATION MAP DATA
  ========================================================= */

  const locationLatitude = Number(
    complaint.location?.latitude
  );

  const locationLongitude = Number(
    complaint.location?.longitude
  );

  const hasMapCoordinates =
    Number.isFinite(locationLatitude) &&
    Number.isFinite(locationLongitude);

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
            navigate("/admin/complaints")
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft size={17} />
          Back to Complaints
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-[#D8E5EC] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0">
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

                {requiresManualReview && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    <BrainCircuit size={13} />
                    Manual Review Required
                  </span>
                )}

                {isPotentialDuplicate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F6F4] px-3 py-1 text-xs font-bold text-[#176D72]">
                    <Copy size={13} />
                    Potential Duplicate
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#16324A] sm:text-3xl">
                {complaint.title}
              </h1>

              <p className="mt-2 break-all text-xs text-[#8A9EAC]">
                Complaint ID: {complaint._id}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#60798C]">
              <CalendarDays size={17} />

              {formatDate(
                complaint.createdAt
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">

            {/* =================================================
                COMPLAINT DETAILS
            ================================================= */}

            <SectionCard
              title="Complaint Details"
              icon={<FileText size={20} />}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#425D70]">
                  {complaint.description}
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoField
                  label="Category"
                  value={formatCategory(
                    complaint.category
                  )}
                />

                <InfoField
                  label="Submitted Language"
                  value={
                    complaint.submittedLanguage ||
                    "-"
                  }
                />

                <InfoField
                  label="Status"
                  value={formatStatus(
                    complaint.status
                  )}
                />

                <InfoField
                  label="Priority"
                  value={
                    complaint.priority || "-"
                  }
                />
              </div>
            </SectionCard>

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            <SectionCard
              title="AI Analysis"
              icon={
                <BrainCircuit size={20} />
              }
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoField
                  label="Predicted Category"
                  value={formatCategory(
                    complaint.category
                  )}
                />

                <InfoField
                  label="Category Confidence"
                  value={formatConfidence(
                    complaint.aiPrediction
                      ?.categoryConfidence
                  )}
                />

                <InfoField
                  label="Predicted Priority"
                  value={
                    complaint.priority || "-"
                  }
                />

                <InfoField
                  label="Priority Confidence"
                  value={formatConfidence(
                    complaint.aiPrediction
                      ?.priorityConfidence
                  )}
                />

                <InfoField
                  label="Detected Language"
                  value={
                    complaint.aiPrediction
                      ?.detectedLanguage ||
                    "-"
                  }
                />

                <InfoField
                  label="Manual Review"
                  value={
                    requiresManualReview
                      ? "Required"
                      : "Not Required"
                  }
                />
              </div>

              {complaint.aiPrediction
                ?.translatedText && (
                <div className="mt-6 rounded-xl bg-[#F1F7FA] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                    AI Translation / Processing Text
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#425D70]">
                    {
                      complaint.aiPrediction
                        .translatedText
                    }
                  </p>
                </div>
              )}
            </SectionCard>

            {/* =================================================
                DUPLICATE ANALYSIS
            ================================================= */}

            <SectionCard
              title="Duplicate Analysis"
              icon={<Copy size={20} />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoField
                  label="Potential Duplicate"
                  value={
                    isPotentialDuplicate
                      ? "Yes"
                      : "No"
                  }
                />

                <InfoField
                  label="Similarity Score"
                  value={
                    typeof complaint
                      .duplicateInfo
                      ?.similarityScore ===
                    "number"
                      ? `${(
                          complaint
                            .duplicateInfo
                            .similarityScore *
                          100
                        ).toFixed(1)}%`
                      : "-"
                  }
                />
              </div>

              {matchedComplaint && (
                <div className="mt-6 rounded-xl border border-[#B9DDDA] bg-[#E8F6F4]/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#176D72]">
                    Matched Complaint
                  </p>

                  <p className="mt-2 font-bold text-[#16324A]">
                    {matchedComplaint.title ||
                      "Matched Complaint"}
                  </p>

                  {matchedComplaint.description && (
                    <p className="mt-2 text-sm leading-6 text-[#60798C]">
                      {
                        matchedComplaint.description
                      }
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchedComplaint.category && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#176D72]">
                        {formatCategory(
                          matchedComplaint.category
                        )}
                      </span>
                    )}

                    {matchedComplaint.status && (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#60798C]">
                        {formatStatus(
                          matchedComplaint.status
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isPotentialDuplicate &&
                !duplicateAlreadyConfirmed && (
                  <div className="mt-6 border-t border-[#D8E5EC] pt-6">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <AlertCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <div>
                          <p className="text-sm font-bold text-amber-800">
                            Administrative Review Required
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-700">
                            The AI system has flagged this
                            complaint as a potential
                            duplicate. Review the matched
                            complaint before continuing
                            normal processing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {duplicateReviewSuccess && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-emerald-600"
                          />

                          <p className="text-sm font-semibold text-emerald-700">
                            {duplicateReviewSuccess}
                          </p>
                        </div>
                      </div>
                    )}

                    {duplicateReviewError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle
                            size={18}
                            className="shrink-0 text-red-600"
                          />

                          <p className="text-sm font-semibold text-red-700">
                            {duplicateReviewError}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <label
                        htmlFor="duplicateRemarks"
                        className="mb-2 block text-sm font-semibold text-[#425D70]"
                      >
                        Review Remarks
                      </label>

                      <textarea
                        id="duplicateRemarks"
                        rows={4}
                        value={duplicateRemarks}
                        onChange={(event) =>
                          setDuplicateRemarks(
                            event.target.value
                          )
                        }
                        disabled={
                          duplicateReviewLoading
                        }
                        placeholder="Optional remarks about this duplicate review..."
                        className="w-full resize-none rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={
                          handleRejectDuplicate
                        }
                        disabled={
                          duplicateReviewLoading
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm font-bold text-[#425D70] transition hover:border-[#1B8A8F] hover:bg-[#E8F6F4] hover:text-[#176D72] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {duplicateReviewLoading ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={17} />
                        )}

                        Reject Duplicate Flag
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleConfirmDuplicate
                        }
                        disabled={
                          duplicateReviewLoading
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B8A8F] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#176D72] disabled:cursor-not-allowed disabled:bg-[#9BC9C9]"
                      >
                        {duplicateReviewLoading ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Copy size={17} />
                        )}

                        Confirm Duplicate
                      </button>
                    </div>
                  </div>
                )}

              {duplicateAlreadyConfirmed && (
                <div className="mt-6 rounded-xl border border-[#B9DDDA] bg-[#E8F6F4] p-4">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-[#1B8A8F]"
                    />

                    <div>
                      <p className="text-sm font-bold text-[#155E63]">
                        Duplicate Confirmed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#176D72]">
                        This complaint has been reviewed and
                        confirmed as a duplicate. It will
                        not be forwarded for normal officer
                        processing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* =================================================
                STATUS HISTORY
            ================================================= */}

            <SectionCard
              title="Complaint Status History"
              icon={<History size={20} />}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#60798C]">
                    Complete processing timeline for this
                    complaint.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadComplaintHistory}
                  disabled={loadingHistory}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#D8E5EC] bg-white px-3 py-2 text-xs font-bold text-[#60798C] transition hover:border-[#8FC6CC] hover:text-[#1B8A8F] disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={
                      loadingHistory
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>

              {loadingHistory && (
                <div className="flex items-center justify-center py-10">
                  <Loader2
                    size={26}
                    className="animate-spin text-[#1F5F8B]"
                  />
                </div>
              )}

              {!loadingHistory &&
                historyError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="text-sm font-bold text-red-700">
                          Unable to load history
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                          {historyError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {!loadingHistory &&
                !historyError &&
                history.length === 0 && (
                  <div className="rounded-xl bg-[#F6F9FB] px-5 py-8 text-center">
                    <History
                      size={28}
                      className="mx-auto text-[#B7C8D3]"
                    />

                    <p className="mt-3 text-sm font-bold text-[#425D70]">
                      No history available
                    </p>

                    <p className="mt-1 text-xs text-[#60798C]">
                      Complaint status changes will appear
                      here.
                    </p>
                  </div>
                )}

              {!loadingHistory &&
                !historyError &&
                history.length > 0 && (
                  <div className="relative">
                    {history.map(
                      (historyItem, index) => {
                        const isLast =
                          index ===
                          history.length - 1;

                        const changedBy =
                          historyItem.changedBy;

                        return (
                          <div
                            key={
                              historyItem._id ||
                              index
                            }
                            className="relative flex gap-4 pb-7 last:pb-0"
                          >
                            {!isLast && (
                              <div className="absolute left-[11px] top-6 h-full w-px bg-[#D8E5EC]" />
                            )}

                            <div
                              className={`relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-4 border-white shadow-sm ${getHistoryDotStyle(
                                historyItem.newStatus
                              )}`}
                            />

                            <div className="min-w-0 flex-1 rounded-xl border border-[#D8E5EC] bg-[#F8FBFC] p-4">
                              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {historyItem.previousStatus ? (
                                      <>
                                        <span
                                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                                            historyItem.previousStatus
                                          )}`}
                                        >
                                          {formatStatus(
                                            historyItem.previousStatus
                                          )}
                                        </span>

                                        <ArrowRight
                                          size={14}
                                          className="text-[#8A9EAC]"
                                        />
                                      </>
                                    ) : null}

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                                        historyItem.newStatus
                                      )}`}
                                    >
                                      {formatStatus(
                                        historyItem.newStatus
                                      )}
                                    </span>
                                  </div>

                                  {historyItem.remarks && (
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#60798C]">
                                      {
                                        historyItem.remarks
                                      }
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#8A9EAC]">
                                  <Clock3 size={14} />

                                  {formatDate(
                                    historyItem.createdAt
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#D8E5EC] pt-3">
                                <User
                                  size={14}
                                  className="text-[#8A9EAC]"
                                />

                                <span className="text-xs font-semibold text-[#425D70]">
                                  {changedBy?.fullName ||
                                    "System User"}
                                </span>

                                <span className="text-xs text-[#B7C8D3]">
                                  •
                                </span>

                                <span className="text-xs font-medium text-[#60798C]">
                                  {formatRole(
                                    changedBy?.role
                                  )}
                                </span>

                                {changedBy?.email && (
                                  <>
                                    <span className="text-xs text-[#B7C8D3]">
                                      •
                                    </span>

                                    <span className="break-all text-xs text-[#8A9EAC]">
                                      {
                                        changedBy.email
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </SectionCard>

            {/* =================================================
                SUPPORTING IMAGES
            ================================================= */}

            <SectionCard
              title="Supporting Images"
              icon={
                <ImageIcon size={20} />
              }
            >
              {images.length === 0 ? (
                <p className="text-sm text-[#60798C]">
                  No supporting images were submitted.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {images.map(
                    (image, index) => {
                      const imageUrl =
                        image.url ||
                        image.secure_url ||
                        image.imageUrl ||
                        image;

                      return (
                        <a
                          key={
                            image.publicId ||
                            image._id ||
                            index
                          }
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-xl border border-[#D8E5EC] bg-[#F6F9FB] transition hover:border-[#8FC6CC]"
                        >
                          <img
                            src={imageUrl}
                            alt={`Complaint ${
                              index + 1
                            }`}
                            className="h-52 w-full object-cover"
                          />
                        </a>
                      );
                    }
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="space-y-6">

            <SectionCard
              title="Citizen Information"
              icon={<User size={20} />}
            >
              <InfoRow
                icon={<User size={16} />}
                label="Name"
                value={
                  complaint.citizen?.fullName ||
                  "-"
                }
              />

              <InfoRow
                icon={<Mail size={16} />}
                label="Email"
                value={
                  complaint.citizen?.email ||
                  "-"
                }
              />

              <InfoRow
                icon={
                  <Languages size={16} />
                }
                label="Preferred Language"
                value={
                  complaint.citizen
                    ?.preferredLanguage ||
                  "-"
                }
              />
            </SectionCard>

            {/* =================================================
                LOCATION
            ================================================= */}

            <SectionCard
              title="Location"
              icon={<MapPin size={20} />}
            >
              {complaint.location &&
              Object.keys(
                complaint.location
              ).length > 0 ? (
                <div className="space-y-4">

                  <div className="space-y-3">
                    {complaint.location?.address && (
                      <InfoField
                        label="Address"
                        value={
                          complaint.location.address
                        }
                      />
                    )}

                    {hasMapCoordinates && (
                      <>
                        <InfoField
                          label="Latitude"
                          value={
                            locationLatitude
                          }
                        />

                        <InfoField
                          label="Longitude"
                          value={
                            locationLongitude
                          }
                        />
                      </>
                    )}
                  </div>

                  {hasMapCoordinates ? (
                    <div className="overflow-hidden rounded-xl border border-[#D8E5EC]">
                      <div className="h-64 w-full">
                        <MapContainer
                          center={[
                            locationLatitude,
                            locationLongitude,
                          ]}
                          zoom={16}
                          scrollWheelZoom={false}
                          dragging={true}
                          className="h-full w-full"
                          style={{
                            height: "256px",
                            width: "100%",
                          }}
                        >
                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <CircleMarker
                            center={[
                              locationLatitude,
                              locationLongitude,
                            ]}
                            radius={10}
                            pathOptions={{
                              color: "#123B5D",
                              fillColor: "#1B8A8F",
                              fillOpacity: 0.9,
                            }}
                          >
                            <Popup>
                              <div>
                                <strong>
                                  Complaint Location
                                </strong>

                                <br />

                                {complaint.location
                                  ?.address ||
                                  "Selected complaint location"}

                                <br />

                                {locationLatitude.toFixed(
                                  6
                                )}
                                {", "}
                                {locationLongitude.toFixed(
                                  6
                                )}
                              </div>
                            </Popup>
                          </CircleMarker>
                        </MapContainer>
                      </div>

                      <div className="border-t border-[#D8E5EC] bg-[#F6F9FB] px-4 py-3">
                        <p className="flex items-start gap-2 text-xs leading-5 text-[#60798C]">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[#1B8A8F]"
                          />

                          Exact complaint location based
                          on the coordinates submitted by
                          the citizen.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#F6F9FB] p-4">
                      <div className="flex gap-3">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-[#8A9EAC]"
                        />

                        <p className="text-sm leading-6 text-[#60798C]">
                          GPS coordinates were not
                          provided for this complaint, so
                          a map preview is unavailable.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#60798C]">
                  No location details available.
                </p>
              )}
            </SectionCard>

            {/* =================================================
                CURRENT ASSIGNMENT
            ================================================= */}

            <SectionCard
              title="Current Assignment"
              icon={
                <Building2 size={20} />
              }
            >
              <InfoRow
                icon={
                  <Building2 size={16} />
                }
                label="Department"
                value={
                  complaint.department?.name ||
                  "Not Assigned"
                }
              />

              <InfoRow
                icon={
                  <UserCheck size={16} />
                }
                label="Officer"
                value={
                  complaint.assignedOfficer
                    ?.fullName ||
                  "Not Assigned"
                }
              />
            </SectionCard>

            {isPotentialDuplicate &&
              !duplicateAlreadyConfirmed && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex gap-3">
                    <AlertCircle
                      size={21}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="font-bold text-amber-800">
                        Processing Paused
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Complete the duplicate review
                        before assigning the complaint or
                        changing its normal processing
                        status.
                      </p>
                    </div>
                  </div>
                </section>
              )}

            {/* =================================================
                ASSIGN / REASSIGN
            ================================================= */}

            {canAssign && (
              <SectionCard
                title={
                  complaint.assignedOfficer
                    ? "Reassign Complaint"
                    : "Assign Complaint"
                }
                icon={
                  <UserCheck size={20} />
                }
              >
                <form
                  onSubmit={
                    handleAssignComplaint
                  }
                  className="space-y-4"
                >
                  {assignmentSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                      {assignmentSuccess}
                    </div>
                  )}

                  {assignmentError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {assignmentError}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                      Department
                    </label>

                    <select
                      value={
                        selectedDepartment
                      }
                      onChange={(event) => {
                        setSelectedDepartment(
                          event.target.value
                        );

                        setSelectedOfficer("");
                        setAssignmentSuccess("");
                        setAssignmentError("");
                      }}
                      disabled={
                        loadingDepartments ||
                        assigning
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    >
                      <option value="">
                        {loadingDepartments
                          ? "Loading departments..."
                          : "Select department"}
                      </option>

                      {departments.map(
                        (department) => (
                          <option
                            key={
                              department._id
                            }
                            value={
                              department._id
                            }
                          >
                            {department.name}
                            {department.code
                              ? ` (${department.code})`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                      Officer
                    </label>

                    <select
                      value={selectedOfficer}
                      onChange={(event) =>
                        setSelectedOfficer(
                          event.target.value
                        )
                      }
                      disabled={
                        !selectedDepartment ||
                        loadingOfficers ||
                        assigning
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    >
                      <option value="">
                        {!selectedDepartment
                          ? "Select department first"
                          : loadingOfficers
                            ? "Loading officers..."
                            : officers.length ===
                                0
                              ? "No active officers available"
                              : "Select officer"}
                      </option>

                      {officers.map(
                        (officer) => (
                          <option
                            key={officer._id}
                            value={officer._id}
                          >
                            {officer.fullName}
                            {officer.email
                              ? ` - ${officer.email}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                      Assignment Remarks
                    </label>

                    <textarea
                      rows={4}
                      value={
                        assignmentRemarks
                      }
                      onChange={(event) =>
                        setAssignmentRemarks(
                          event.target.value
                        )
                      }
                      disabled={assigning}
                      placeholder="Optional remarks about this assignment..."
                      className="w-full resize-none rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      assigning ||
                      !selectedDepartment ||
                      !selectedOfficer
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#174D72] disabled:cursor-not-allowed disabled:bg-[#AABBC5]"
                  >
                    {assigning ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Assigning...
                      </>
                    ) : (
                      <>
                        <Send size={17} />

                        {complaint.assignedOfficer
                          ? "Reassign Complaint"
                          : "Assign Complaint"}
                      </>
                    )}
                  </button>
                </form>
              </SectionCard>
            )}

            {/* =================================================
                STATUS UPDATE
            ================================================= */}

            {canUpdateStatus && (
              <SectionCard
                title="Update Complaint Status"
                icon={
                  <RefreshCw size={20} />
                }
              >
                <form
                  onSubmit={
                    handleUpdateStatus
                  }
                  className="space-y-4"
                >
                  <div className="rounded-xl bg-[#F6F9FB] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                      Current Status
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {formatStatus(
                          complaint.status
                        )}
                      </span>
                    </div>
                  </div>

                  {statusUpdateSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-emerald-600"
                        />

                        <p className="text-sm font-semibold text-emerald-700">
                          {statusUpdateSuccess}
                        </p>
                      </div>
                    </div>
                  )}

                  {statusUpdateError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          size={18}
                          className="shrink-0 text-red-600"
                        />

                        <p className="text-sm font-semibold text-red-700">
                          {statusUpdateError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                      New Status
                    </label>

                    <select
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(
                          event.target.value
                        );

                        setStatusUpdateError("");
                        setStatusUpdateSuccess("");
                      }}
                      disabled={
                        updatingStatus
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    >
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
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                      Status Remarks
                    </label>

                    <textarea
                      rows={4}
                      value={statusRemarks}
                      onChange={(event) =>
                        setStatusRemarks(
                          event.target.value
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                      placeholder="Add remarks about this status update..."
                      className="w-full resize-none rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      updatingStatus ||
                      !selectedStatus ||
                      selectedStatus ===
                        complaint.status
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B5D] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0E2C43] disabled:cursor-not-allowed disabled:bg-[#AABBC5]"
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={17} />
                        Update Status
                      </>
                    )}
                  </button>
                </form>
              </SectionCard>
            )}

            {/* =================================================
                TERMINAL STATUS
            ================================================= */}

            {terminalStatus &&
              !duplicateAlreadyConfirmed && (
                <section className="rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={21}
                      className="mt-0.5 shrink-0 text-[#1B8A8F]"
                    />

                    <div>
                      <p className="font-bold text-[#16324A]">
                        Complaint Processing Completed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#60798C]">
                        This complaint currently has a{" "}
                        <span className="font-semibold">
                          {formatStatus(
                            complaint.status
                          )}
                        </span>{" "}
                        status.
                      </p>
                    </div>
                  </div>
                </section>
              )}

            {/* =================================================
                ADMIN REMARKS
            ================================================= */}

            <SectionCard
              title="Administrative Review"
              icon={
                <CheckCircle2 size={20} />
              }
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                Latest Admin Remarks
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#60798C]">
                {complaint.adminRemarks ||
                  "No administrative remarks have been added yet."}
              </p>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#D8E5EC] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
          {icon}
        </div>

        <h2 className="text-lg font-bold text-[#16324A]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   INFO FIELD
========================================================= */

function InfoField({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold capitalize text-[#425D70]">
        {String(value ?? "-")}
      </p>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3 border-b border-[#EDF3F6] py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mt-0.5 text-[#1B8A8F]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#8A9EAC]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#425D70]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default AdminComplaintDetailsPage;