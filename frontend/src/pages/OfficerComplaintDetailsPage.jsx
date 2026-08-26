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
  CalendarDays,
  MapPin,
  Clock3,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Loader2,
  Building2,
  Languages,
  MessageSquareText,
  ShieldCheck,
  Save,
  Tag,
} from "lucide-react";

import {
  getOfficerComplaintById,
  updateOfficerComplaintStatus,
} from "../api/officerComplaintApi";

/* =========================================================
   OFFICER COMPLAINT DETAILS PAGE
========================================================= */

function OfficerComplaintDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [remarks, setRemarks] = useState("");

  /* =========================================================
     GET TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD COMPLAINT
  ========================================================= */

  useEffect(() => {
    const loadComplaint = async () => {
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
          await getOfficerComplaintById(
            id,
            token
          );

        if (!response?.complaint) {
          throw new Error(
            "Complaint details could not be found."
          );
        }

        setComplaint(response.complaint);

        setSelectedStatus(
          response.complaint.status ||
            "assigned"
        );
      } catch (err) {
        console.error(
          "Officer complaint details loading error:",
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

    loadComplaint();
  }, [id, navigate]);

  /* =========================================================
     FORMAT CATEGORY
  ========================================================= */

  const formatCategory = (category) => {
    if (!category) {
      return "-";
    }

    return String(category)
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  };

  /* =========================================================
     FORMAT STATUS
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
        return status
          ? formatCategory(status)
          : "-";
    }
  };

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case "assigned":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";

      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  /* =========================================================
     PRIORITY STYLE
  ========================================================= */

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-100";

      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  /* =========================================================
     FORMAT PRIORITY
  ========================================================= */

  const formatPriority = (priority) => {
    if (!priority) {
      return "Priority Unknown";
    }

    const value =
      String(priority);

    return `${value
      .charAt(0)
      .toUpperCase()}${value.slice(
      1
    )} Priority`;
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

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
     FORMAT DATE + TIME
  ========================================================= */

  const formatDateTime = (date) => {
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

  /* =========================================================
     FORMAT LANGUAGE
  ========================================================= */

  const formatLanguage = (language) => {
    switch (
      language?.toLowerCase()
    ) {
      case "english":
        return "English";

      case "sinhala":
        return "Sinhala";

      case "tamil":
        return "Tamil";

      default:
        return language || "-";
    }
  };

  /* =========================================================
     FORMAT LOCATION
  ========================================================= */

  const formatLocation = (location) => {
    if (!location) {
      return "Not provided";
    }

    if (
      typeof location === "string"
    ) {
      return (
        location.trim() ||
        "Not provided"
      );
    }

    if (
      typeof location === "object"
    ) {
      if (
        typeof location.address ===
          "string" &&
        location.address.trim()
      ) {
        return location.address.trim();
      }

      const locationParts = [
        location.street,
        location.area,
        location.city,
        location.district,
      ].filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      );

      if (
        locationParts.length > 0
      ) {
        return locationParts.join(
          ", "
        );
      }
    }

    return "Not provided";
  };

  /* =========================================================
     LOCATION MAP DATA
  ========================================================= */

  const locationLatitude =
    Number(
      complaint?.location
        ?.latitude
    );

  const locationLongitude =
    Number(
      complaint?.location
        ?.longitude
    );

  const hasMapCoordinates =
    Number.isFinite(
      locationLatitude
    ) &&
    Number.isFinite(
      locationLongitude
    );

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const handleStatusUpdate =
    async () => {
      try {
        setError("");
        setSuccessMessage("");

        if (!selectedStatus) {
          setError(
            "Please select a complaint status."
          );

          return;
        }

        if (
          selectedStatus ===
          complaint?.status
        ) {
          setError(
            "Please select a different status before updating."
          );

          return;
        }

        if (
          selectedStatus ===
            "resolved" &&
          complaint?.status !==
            "in_progress"
        ) {
          setError(
            "Complaint must be in progress before it can be resolved."
          );

          return;
        }

        if (
          selectedStatus ===
            "in_progress" &&
          complaint?.status !==
            "assigned"
        ) {
          setError(
            "Only an assigned complaint can be moved to in progress."
          );

          return;
        }

        const token =
          getToken();

        if (!token) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        setUpdating(true);

        const statusData = {
          status:
            selectedStatus,

          remarks:
            remarks.trim(),
        };

        const response =
          await updateOfficerComplaintStatus(
            id,
            statusData,
            token
          );

        if (
          response?.complaint
        ) {
          setComplaint(
            response.complaint
          );

          setSelectedStatus(
            response.complaint
              .status ||
              selectedStatus
          );
        } else {
          setComplaint(
            (previous) => ({
              ...previous,
              status:
                selectedStatus,
            })
          );
        }

        setRemarks("");

        setSuccessMessage(
          response?.message ||
            "Complaint status updated successfully."
        );
      } catch (err) {
        console.error(
          "Complaint status update error:",
          err
        );

        if (
          Array.isArray(
            err?.errors
          ) &&
          err.errors.length >
            0
        ) {
          setError(
            err.errors
              .map(
                (item) =>
                  item.msg ||
                  item.message
              )
              .join(" ")
          );
        } else {
          setError(
            err?.message ||
              "Unable to update complaint status."
          );
        }
      } finally {
        setUpdating(false);
      }
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
              size={38}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading complaint details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR / NOT FOUND
  ========================================================= */

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/officer/complaints"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft
              size={17}
            />

            Back to Assigned Complaints
          </button>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle
              size={40}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-bold text-red-800">
              Unable to Load Complaint
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "Complaint details could not be found."}
            </p>
          </div>
        </main>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/officer/complaints"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Assigned Complaints
        </button>

        {/* HEADER */}

        <section className="mt-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Officer Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                Complaint Details
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Review the assigned complaint,
                update its progress and
                complete the complaint
                resolution process.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
                  complaint.status
                )}`}
              >
                {formatStatus(
                  complaint.status
                )}
              </span>

              <span
                className={`rounded-full border px-4 py-2 text-xs font-bold ${getPriorityStyle(
                  complaint.priority
                )}`}
              >
                {formatPriority(
                  complaint.priority
                )}
              </span>
            </div>
          </div>
        </section>

        {/* MESSAGES */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p>
              {successMessage}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-6">

            {/* COMPLAINT INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Complaint Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Main details of the assigned
                    complaint.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Complaint Title
                </p>

                <h3 className="mt-2 text-xl font-bold leading-8 text-slate-900">
                  {complaint.title ||
                    "Untitled Complaint"}
                </h3>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {complaint.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <InfoItem
                  icon={
                    <Tag
                      size={18}
                    />
                  }
                  label="Category"
                  value={formatCategory(
                    complaint.category
                  )}
                />

                <InfoItem
                  icon={
                    <ShieldCheck
                      size={18}
                    />
                  }
                  label="Priority"
                  value={formatPriority(
                    complaint.priority
                  )}
                />

                <InfoItem
                  icon={
                    <Languages
                      size={18}
                    />
                  }
                  label="Submitted Language"
                  value={formatLanguage(
                    complaint.submittedLanguage
                  )}
                />

                <InfoItem
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                  label="Submitted Date"
                  value={formatDate(
                    complaint.createdAt
                  )}
                />
              </div>
            </section>

            {/* LOCATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <MapPin
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Location Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Exact location related to
                    this complaint.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={
                    <MapPin
                      size={18}
                    />
                  }
                  label="Location"
                  value={
                    formatLocation(
                      complaint.location
                    ) !==
                    "Not provided"
                      ? formatLocation(
                          complaint.location
                        )
                      : complaint.address ||
                        "Not provided"
                  }
                />

                <InfoItem
                  icon={
                    <Building2
                      size={18}
                    />
                  }
                  label="Department"
                  value={
                    complaint.department
                      ?.name ||
                    complaint.departmentName ||
                    formatCategory(
                      complaint.category
                    )
                  }
                />

                {hasMapCoordinates && (
                  <>
                    <InfoItem
                      icon={
                        <MapPin
                          size={18}
                        />
                      }
                      label="Latitude"
                      value={
                        locationLatitude
                      }
                    />

                    <InfoItem
                      icon={
                        <MapPin
                          size={18}
                        />
                      }
                      label="Longitude"
                      value={
                        locationLongitude
                      }
                    />
                  </>
                )}
              </div>

              {hasMapCoordinates ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="h-[320px] w-full">
                    <MapContainer
                      center={[
                        locationLatitude,
                        locationLongitude,
                      ]}
                      zoom={16}
                      scrollWheelZoom={
                        false
                      }
                      className="h-full w-full"
                      style={{
                        height:
                          "320px",
                        width:
                          "100%",
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
                          fillOpacity:
                            0.9,
                        }}
                      >
                        <Popup>
                          <div>
                            <strong>
                              Complaint Location
                            </strong>

                            <br />

                            {formatLocation(
                              complaint.location
                            )}

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

                  <div className="border-t border-slate-200 bg-white px-4 py-3">
                    <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-violet-600"
                      />

                      Exact complaint location
                      based on the coordinates
                      submitted by the citizen.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <p className="text-sm leading-6 text-slate-500">
                      GPS coordinates were not
                      provided for this complaint,
                      so a map preview is
                      unavailable.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* CITIZEN INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <User
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Citizen Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Citizen who submitted
                    this complaint.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={
                    <User
                      size={18}
                    />
                  }
                  label="Citizen Name"
                  value={
                    complaint.citizen
                      ?.fullName ||
                    "Unknown Citizen"
                  }
                />

                <InfoItem
                  icon={
                    <MessageSquareText
                      size={18}
                    />
                  }
                  label="Citizen Email"
                  value={
                    complaint.citizen
                      ?.email ||
                    "Not available"
                  }
                />
              </div>
            </section>

            {/* SYSTEM INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold">
                System Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                  label="Complaint ID"
                  value={
                    complaint._id
                  }
                  breakText
                />

                <InfoItem
                  icon={
                    <Clock3
                      size={18}
                    />
                  }
                  label="Last Updated"
                  value={formatDateTime(
                    complaint.updatedAt
                  )}
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="font-bold">
                    Update Progress
                  </h2>

                  <p className="text-xs text-slate-500">
                    Change complaint status
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Complaint Status
                </label>

                <select
                  id="status"
                  value={
                    selectedStatus
                  }
                  disabled={
                    updating ||
                    complaint.status ===
                      "resolved"
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedStatus(
                      event.target.value
                    );

                    setError("");
                    setSuccessMessage(
                      ""
                    );
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
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

              <div className="mt-5">
                <label
                  htmlFor="remarks"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Officer Remarks
                </label>

                <textarea
                  id="remarks"
                  rows={5}
                  value={remarks}
                  disabled={
                    updating ||
                    complaint.status ===
                      "resolved"
                  }
                  onChange={(
                    event
                  ) => {
                    setRemarks(
                      event.target.value
                    );

                    setError("");
                    setSuccessMessage(
                      ""
                    );
                  }}
                  placeholder="Add progress or resolution remarks..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              {complaint.status ===
                "resolved" && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <p className="text-sm leading-6 text-emerald-700">
                      This complaint has
                      already been resolved.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  updating ||
                  complaint.status ===
                    "resolved" ||
                  selectedStatus ===
                    complaint.status
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Updating...
                  </>
                ) : (
                  <>
                    <Save
                      size={18}
                    />

                    Update Status
                  </>
                )}
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold">
                Complaint Progress
              </h2>

              <div className="mt-6 space-y-5">
                <ProgressItem
                  icon={
                    <CircleDot
                      size={18}
                    />
                  }
                  title="Assigned"
                  description="Complaint assigned to officer."
                  active={[
                    "assigned",
                    "in_progress",
                    "resolved",
                  ].includes(
                    complaint.status
                  )}
                />

                <ProgressItem
                  icon={
                    <Clock3
                      size={18}
                    />
                  }
                  title="In Progress"
                  description="Officer started processing the complaint."
                  active={[
                    "in_progress",
                    "resolved",
                  ].includes(
                    complaint.status
                  )}
                />

                <ProgressItem
                  icon={
                    <CheckCircle2
                      size={18}
                    />
                  }
                  title="Resolved"
                  description="Complaint resolution completed."
                  active={
                    complaint.status ===
                    "resolved"
                  }
                  last
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   INFORMATION ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
  breakText = false,
}) {
  const getDisplayValue = () => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return value;
    }

    if (
      typeof value === "boolean"
    ) {
      return value
        ? "Yes"
        : "No";
    }

    if (
      Array.isArray(value)
    ) {
      if (
        value.length === 0
      ) {
        return "-";
      }

      return value
        .map((item) => {
          if (
            typeof item ===
              "string" ||
            typeof item ===
              "number"
          ) {
            return String(
              item
            );
          }

          if (
            item &&
            typeof item ===
              "object"
          ) {
            return (
              item.address ||
              item.name ||
              item.fullName ||
              "-"
            );
          }

          return "-";
        })
        .join(", ");
    }

    if (
      value &&
      typeof value ===
        "object"
    ) {
      return (
        value.address ||
        value.name ||
        value.fullName ||
        "-"
      );
    }

    return String(value);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 text-sm font-semibold text-slate-700 ${
            breakText
              ? "break-all"
              : ""
          }`}
        >
          {getDisplayValue()}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS ITEM
========================================================= */

function ProgressItem({
  icon,
  title,
  description,
  active,
  last = false,
}) {
  return (
    <div className="relative flex gap-4">
      {!last && (
        <div
          className={`absolute left-[17px] top-9 h-[calc(100%+4px)] w-px ${
            active
              ? "bg-blue-200"
              : "bg-slate-200"
          }`}
        />
      )}

      <div
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div className="pb-3">
        <p
          className={`text-sm font-bold ${
            active
              ? "text-slate-900"
              : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default OfficerComplaintDetailsPage;