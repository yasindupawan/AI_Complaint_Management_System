import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import L from "leaflet";
import "leaflet.heat";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import {
  ArrowLeft,
  FileText,
  Users,
  Building2,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ShieldCheck,
  Loader2,
  BarChart3,
  UserCheck,
  UserX,
  Layers3,
  Filter,
  RefreshCw,
  TrendingUp,
  Activity,
  MapPinned,
  MapPin,
  Flame,
  Download,
  Printer,
  FileSpreadsheet,
  CalendarDays,
  Eye,
  CircleGauge,
  X,
} from "lucide-react";

import {
  getAllAdminComplaints,
} from "../api/adminComplaintApi";

import {
  getUserStatistics,
} from "../api/adminUserApi";

import {
  getDepartments,
} from "../api/departmentApi";

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORY_OPTIONS = [
  "roads",
  "water_supply",
  "electricity",
  "drainage",
  "garbage",
  "environment",
];

const STATUS_OPTIONS = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
  "duplicate",
];

const PRIORITY_OPTIONS = [
  "high",
  "medium",
  "low",
];

const SRI_LANKA_CENTER = [
  7.8731,
  80.7718,
];

/* =========================================================
   HEATMAP LAYER
========================================================= */

function ComplaintHeatmapLayer({
  complaints,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !map ||
      !Array.isArray(complaints) ||
      complaints.length === 0
    ) {
      return undefined;
    }

    const heatPoints =
      complaints.map(
        (complaint) => [
          complaint.latitude,
          complaint.longitude,
          complaint.priority === "high"
            ? 1
            : complaint.priority === "medium"
            ? 0.7
            : 0.5,
        ]
      );

    const heatLayer =
      L.heatLayer(
        heatPoints,
        {
          radius: 28,
          blur: 22,
          maxZoom: 17,
          minOpacity: 0.35,
        }
      );

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(
        heatLayer
      );
    };
  }, [
    map,
    complaints,
  ]);

  return null;
}

/* =========================================================
   ADMIN OVERVIEW PAGE
========================================================= */

function AdminOverviewPage() {
  const navigate =
    useNavigate();

  /* =========================================================
     CORE DATA
  ========================================================= */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    userStatistics,
    setUserStatistics,
  ] = useState(null);

  const [
    departments,
    setDepartments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     FILTERS
  ========================================================= */

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("all");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("all");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  /* =========================================================
     MAP MODE
  ========================================================= */

  const [
    mapMode,
    setMapMode,
  ] = useState("markers");

  /* =========================================================
     GET TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem(
      "token"
    ) ||
    sessionStorage.getItem(
      "token"
    );

  /* =========================================================
     FORMAT CATEGORY
  ========================================================= */

  const formatCategory = (
    category
  ) => {
    if (!category) {
      return "-";
    }

    return String(
      category
    )
      .replace(
        /_/g,
        " "
      )
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  };

  /* =========================================================
     FORMAT STATUS
  ========================================================= */

  const formatStatus = (
    status
  ) => {
    if (!status) {
      return "-";
    }

    return formatCategory(
      status
    );
  };

  /* =========================================================
     FORMAT PRIORITY
  ========================================================= */

  const formatPriority = (
    priority
  ) => {
    if (!priority) {
      return "-";
    }

    const value =
      String(priority);

    return (
      value
        .charAt(0)
        .toUpperCase() +
      value.slice(1)
    );
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

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
     LOAD OVERVIEW
  ========================================================= */

  const loadOverview =
    async () => {
      try {
        setLoading(true);
        setError("");

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

        const [
          complaintsResponse,
          usersResponse,
          departmentsResponse,
        ] =
          await Promise.all([
            getAllAdminComplaints(
              token
            ),

            getUserStatistics(
              token
            ),

            getDepartments(
              token
            ),
          ]);

        setComplaints(
          Array.isArray(
            complaintsResponse
              ?.complaints
          )
            ? complaintsResponse
                .complaints
            : []
        );

        setUserStatistics(
          usersResponse
            ?.statistics ||
            null
        );

        setDepartments(
          Array.isArray(
            departmentsResponse
              ?.departments
          )
            ? departmentsResponse
                .departments
            : []
        );
      } catch (err) {
        console.error(
          "Admin overview loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load system overview information."
        );

        const message =
          err?.message
            ?.toLowerCase() ||
          "";

        if (
          message.includes(
            "token"
          ) ||
          message.includes(
            "unauthorized"
          ) ||
          message.includes(
            "not authorized"
          )
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          sessionStorage.removeItem(
            "token"
          );

          sessionStorage.removeItem(
            "user"
          );

          navigate(
            "/login",
            {
              replace: true,
            }
          );
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadOverview();
  }, []);

  /* =========================================================
     FILTER COMPLAINTS
  ========================================================= */

  const filteredComplaints =
    useMemo(() => {
      return complaints.filter(
        (complaint) => {
          if (
            categoryFilter !==
              "all" &&
            complaint.category !==
              categoryFilter
          ) {
            return false;
          }

          if (
            statusFilter !==
              "all" &&
            complaint.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            priorityFilter !==
              "all" &&
            complaint.priority !==
              priorityFilter
          ) {
            return false;
          }

          if (
            departmentFilter !==
            "all"
          ) {
            const departmentId =
              complaint
                .department
                ?._id ||
              complaint
                .department ||
              null;

            if (
              String(
                departmentId
              ) !==
              String(
                departmentFilter
              )
            ) {
              return false;
            }
          }

          if (
            startDate
          ) {
            const complaintDate =
              new Date(
                complaint.createdAt
              );

            const filterDate =
              new Date(
                `${startDate}T00:00:00`
              );

            if (
              complaintDate <
              filterDate
            ) {
              return false;
            }
          }

          if (endDate) {
            const complaintDate =
              new Date(
                complaint.createdAt
              );

            const filterDate =
              new Date(
                `${endDate}T23:59:59`
              );

            if (
              complaintDate >
              filterDate
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      complaints,
      categoryFilter,
      statusFilter,
      priorityFilter,
      departmentFilter,
      startDate,
      endDate,
    ]);

  /* =========================================================
     COMPLAINT STATISTICS
  ========================================================= */

  const complaintStats =
    useMemo(() => {
      const total =
        filteredComplaints.length;

      const countStatus = (
        status
      ) =>
        filteredComplaints.filter(
          (complaint) =>
            complaint.status ===
            status
        ).length;

      const submitted =
        countStatus(
          "submitted"
        );

      const underReview =
        countStatus(
          "under_review"
        );

      const assigned =
        countStatus(
          "assigned"
        );

      const inProgress =
        countStatus(
          "in_progress"
        );

      const resolved =
        countStatus(
          "resolved"
        );

      const rejected =
        countStatus(
          "rejected"
        );

      const duplicate =
        countStatus(
          "duplicate"
        );

      const resolutionRate =
        total > 0
          ? Math.round(
              (
                resolved /
                total
              ) *
                100
            )
          : 0;

      return {
        total,
        submitted,
        underReview,
        assigned,
        inProgress,
        resolved,
        rejected,
        duplicate,
        resolutionRate,
      };
    }, [
      filteredComplaints,
    ]);

  /* =========================================================
     USER STATISTICS
  ========================================================= */

  const users = {
    total:
      userStatistics
        ?.totalUsers ??
      0,

    citizens:
      userStatistics
        ?.totalCitizens ??
      0,

    officers:
      userStatistics
        ?.totalOfficers ??
      0,

    admins:
      userStatistics
        ?.totalAdmins ??
      0,

    active:
      userStatistics
        ?.activeUsers ??
      0,

    inactive:
      userStatistics
        ?.inactiveUsers ??
      0,
  };

  /* =========================================================
     DEPARTMENT STATISTICS
  ========================================================= */

  const departmentStats =
    useMemo(() => {
      const total =
        departments.length;

      const active =
        departments.filter(
          (department) =>
            department
              .isActive !==
            false
        ).length;

      const inactive =
        departments.filter(
          (department) =>
            department
              .isActive ===
            false
        ).length;

      return {
        total,
        active,
        inactive,
      };
    }, [
      departments,
    ]);

  /* =========================================================
     CATEGORY DISTRIBUTION
  ========================================================= */

  const categoryDistribution =
    useMemo(() => {
      return CATEGORY_OPTIONS.map(
        (category) => ({
          category,

          count:
            filteredComplaints.filter(
              (complaint) =>
                complaint.category ===
                category
            ).length,
        })
      );
    }, [
      filteredComplaints,
    ]);

  /* =========================================================
     PRIORITY DISTRIBUTION
  ========================================================= */

  const priorityDistribution =
    useMemo(() => {
      return PRIORITY_OPTIONS.map(
        (priority) => ({
          priority,

          count:
            filteredComplaints.filter(
              (complaint) =>
                complaint.priority ===
                priority
            ).length,
        })
      );
    }, [
      filteredComplaints,
    ]);

  /* =========================================================
     COMPLAINT TREND - LAST 6 MONTHS
  ========================================================= */

  const complaintTrend =
    useMemo(() => {
      const trend =
        [];

      const currentDate =
        new Date();

      for (
        let index = 5;
        index >= 0;
        index -= 1
      ) {
        const monthDate =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() -
              index,
            1
          );

        const targetYear =
          monthDate.getFullYear();

        const targetMonth =
          monthDate.getMonth();

        const count =
          filteredComplaints.filter(
            (complaint) => {
              const complaintDate =
                new Date(
                  complaint.createdAt
                );

              return (
                complaintDate.getFullYear() ===
                  targetYear &&
                complaintDate.getMonth() ===
                  targetMonth
              );
            }
          ).length;

        trend.push({
          id: `${targetYear}-${targetMonth}`,
          label:
            monthDate.toLocaleDateString(
              "en-GB",
              {
                month:
                  "short",
                year:
                  "2-digit",
              }
            ),
          count,
        });
      }

      return trend;
    }, [
      filteredComplaints,
    ]);

  const maximumTrend =
    Math.max(
      1,
      ...complaintTrend.map(
        (item) =>
          item.count
      )
    );

  /* =========================================================
     DEPARTMENT PERFORMANCE
  ========================================================= */

  const departmentPerformance =
    useMemo(() => {
      return departments.map(
        (department) => {
          const id =
            department._id ||
            department.id;

          const departmentComplaints =
            filteredComplaints.filter(
              (complaint) => {
                const complaintDepartment =
                  complaint
                    .department
                    ?._id ||
                  complaint
                    .department;

                return (
                  String(
                    complaintDepartment ||
                      ""
                  ) ===
                  String(
                    id ||
                      ""
                  )
                );
              }
            );

          const total =
            departmentComplaints.length;

          const assigned =
            departmentComplaints.filter(
              (complaint) =>
                complaint.status ===
                "assigned"
            ).length;

          const inProgress =
            departmentComplaints.filter(
              (complaint) =>
                complaint.status ===
                "in_progress"
            ).length;

          const resolved =
            departmentComplaints.filter(
              (complaint) =>
                complaint.status ===
                "resolved"
            ).length;

          const resolutionRate =
            total > 0
              ? Math.round(
                  (
                    resolved /
                    total
                  ) *
                    100
                )
              : 0;

          return {
            id,

            name:
              department.name ||
              "Unnamed Department",

            code:
              department.code ||
              "-",

            total,
            assigned,
            inProgress,
            resolved,
            resolutionRate,
          };
        }
      );
    }, [
      departments,
      filteredComplaints,
    ]);

  /* =========================================================
     MAP COMPLAINTS
  ========================================================= */

  const mapComplaints =
    useMemo(() => {
      return filteredComplaints
        .map(
          (complaint) => {
            const latitude =
              Number(
                complaint
                  .location
                  ?.latitude
              );

            const longitude =
              Number(
                complaint
                  .location
                  ?.longitude
              );

            if (
              !Number.isFinite(
                latitude
              ) ||
              !Number.isFinite(
                longitude
              )
            ) {
              return null;
            }

            return {
              ...complaint,
              latitude,
              longitude,
            };
          }
        )
        .filter(Boolean);
    }, [
      filteredComplaints,
    ]);

  /* =========================================================
     RECENT COMPLAINTS
  ========================================================= */

  const recentComplaints =
    useMemo(() => {
      return [
        ...filteredComplaints,
      ]
        .sort(
          (
            first,
            second
          ) =>
            new Date(
              second.createdAt
            ) -
            new Date(
              first.createdAt
            )
        )
        .slice(
          0,
          8
        );
    }, [
      filteredComplaints,
    ]);

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters =
    () => {
      setCategoryFilter(
        "all"
      );

      setStatusFilter(
        "all"
      );

      setPriorityFilter(
        "all"
      );

      setDepartmentFilter(
        "all"
      );

      setStartDate("");

      setEndDate("");
    };

  /* =========================================================
     EXPORT CSV REPORT
  ========================================================= */

  const exportCSV =
    () => {
      const headers = [
        "Complaint ID",
        "Title",
        "Category",
        "Priority",
        "Status",
        "Department",
        "Address",
        "Latitude",
        "Longitude",
        "Submitted Date",
      ];

      const rows =
        filteredComplaints.map(
          (complaint) => [
            complaint._id ||
              "",

            complaint.title ||
              "",

            formatCategory(
              complaint.category
            ),

            formatPriority(
              complaint.priority
            ),

            formatStatus(
              complaint.status
            ),

            complaint
              .department
              ?.name ||
              "",

            complaint
              .location
              ?.address ||
              "",

            complaint
              .location
              ?.latitude ??
              "",

            complaint
              .location
              ?.longitude ??
              "",

            formatDate(
              complaint.createdAt
            ),
          ]
        );

      const escapeValue = (
        value
      ) =>
        `"${String(
          value ?? ""
        ).replace(
          /"/g,
          '""'
        )}"`;

      const csv =
        [
          headers,
          ...rows,
        ]
          .map(
            (row) =>
              row
                .map(
                  escapeValue
                )
                .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [
            "\ufeff",
            csv,
          ],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        url;

      anchor.download =
        `complaint-system-report-${new Date()
          .toISOString()
          .slice(
            0,
            10
          )}.csv`;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      document.body.removeChild(
        anchor
      );

      URL.revokeObjectURL(
        url
      );
    };

  /* =========================================================
     PRINT REPORT
  ========================================================= */

  const printReport =
    () => {
      window.print();
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
              Loading system overview...
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
              "/admin/dashboard"
            )
          }
          className="print:hidden inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Admin Dashboard
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                System Overview
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Monitor complaint activity, user participation,
                department performance, geographical issue
                patterns and overall complaint processing
                performance across the system.
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadOverview
              }
              className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <RefreshCw
                size={17}
              />

              Refresh Data
            </button>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p>
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="print:hidden mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Filter
                  size={21}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Dashboard Filters
                </h2>

                <p className="text-sm text-slate-500">
                  Filter analytics, maps and generated reports.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-red-600"
            >
              <X
                size={16}
              />

              Clear Filters
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FilterSelect
              label="Category"
              allLabel="All Categories"
              value={
                categoryFilter
              }
              onChange={
                setCategoryFilter
              }
              options={
                CATEGORY_OPTIONS
              }
              formatOption={
                formatCategory
              }
            />

            <FilterSelect
              label="Status"
              allLabel="All Statuses"
              value={
                statusFilter
              }
              onChange={
                setStatusFilter
              }
              options={
                STATUS_OPTIONS
              }
              formatOption={
                formatStatus
              }
            />

            <FilterSelect
              label="Priority"
              allLabel="All Priorities"
              value={
                priorityFilter
              }
              onChange={
                setPriorityFilter
              }
              options={
                PRIORITY_OPTIONS
              }
              formatOption={
                formatPriority
              }
            />

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Department
              </label>

              <select
                value={
                  departmentFilter
                }
                onChange={(
                  event
                ) =>
                  setDepartmentFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department._id ||
                        department.id
                      }
                      value={
                        department._id ||
                        department.id
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Start Date
              </label>

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                End Date
              </label>

              <input
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">
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
              complaints.
            </p>
          </div>
        </section>

        {/* =====================================================
            MAIN STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Complaints"
            value={
              complaintStats.total
            }
            icon={
              <FileText
                size={22}
              />
            }
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="In Progress"
            value={
              complaintStats.inProgress
            }
            icon={
              <Clock3
                size={22}
              />
            }
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Resolved"
            value={
              complaintStats.resolved
            }
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Resolution Rate"
            value={`${complaintStats.resolutionRate}%`}
            icon={
              <CircleGauge
                size={22}
              />
            }
            iconStyle="bg-violet-50 text-violet-600"
          />
        </section>

        {/* =====================================================
            COMPLAINT PROCESSING
        ===================================================== */}

        <DashboardSection
          title="Complaint Processing Overview"
          subtitle="Current complaint status distribution."
          icon={
            <Layers3
              size={22}
            />
          }
          iconStyle="bg-blue-50 text-blue-600"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <MiniStat
              title="Submitted"
              value={
                complaintStats.submitted
              }
            />

            <MiniStat
              title="Under Review"
              value={
                complaintStats.underReview
              }
            />

            <MiniStat
              title="Assigned"
              value={
                complaintStats.assigned
              }
            />

            <MiniStat
              title="In Progress"
              value={
                complaintStats.inProgress
              }
            />

            <MiniStat
              title="Resolved"
              value={
                complaintStats.resolved
              }
            />

            <MiniStat
              title="Rejected"
              value={
                complaintStats.rejected
              }
            />

            <MiniStat
              title="Duplicates"
              value={
                complaintStats.duplicate
              }
            />
          </div>
        </DashboardSection>

        {/* =====================================================
            USER + DEPARTMENT OVERVIEW
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <DashboardSection
            noMargin
            title="User Overview"
            subtitle="Registered citizens, officers and account status."
            icon={
              <Users
                size={22}
              />
            }
            iconStyle="bg-indigo-50 text-indigo-600"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <OverviewItem
                icon={
                  <Users
                    size={18}
                  />
                }
                label="Total Users"
                value={
                  users.total
                }
              />

              <OverviewItem
                icon={
                  <Users
                    size={18}
                  />
                }
                label="Citizens"
                value={
                  users.citizens
                }
              />

              <OverviewItem
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                label="Officers"
                value={
                  users.officers
                }
              />

              <OverviewItem
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                label="Administrators"
                value={
                  users.admins
                }
              />

              <OverviewItem
                icon={
                  <UserCheck
                    size={18}
                  />
                }
                label="Active Users"
                value={
                  users.active
                }
              />

              <OverviewItem
                icon={
                  <UserX
                    size={18}
                  />
                }
                label="Inactive Users"
                value={
                  users.inactive
                }
              />
            </div>
          </DashboardSection>

          <DashboardSection
            noMargin
            title="Department Overview"
            subtitle="Complaint processing department information."
            icon={
              <Building2
                size={22}
              />
            }
            iconStyle="bg-emerald-50 text-emerald-600"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <OverviewItem
                icon={
                  <Building2
                    size={18}
                  />
                }
                label="Total Departments"
                value={
                  departmentStats.total
                }
              />

              <OverviewItem
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                label="Active Departments"
                value={
                  departmentStats.active
                }
              />

              <OverviewItem
                icon={
                  <AlertCircle
                    size={18}
                  />
                }
                label="Inactive Departments"
                value={
                  departmentStats.inactive
                }
              />

              <OverviewItem
                icon={
                  <Users
                    size={18}
                  />
                }
                label="Total Officers"
                value={
                  users.officers
                }
              />
            </div>
          </DashboardSection>
        </div>

        {/* =====================================================
            CATEGORY + PRIORITY
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <DistributionSection
            title="Complaint Category Distribution"
            subtitle="Complaints received under each AI classification category."
            items={
              categoryDistribution
            }
            total={
              complaintStats.total
            }
            itemKey="category"
            formatLabel={
              formatCategory
            }
          />

          <DistributionSection
            title="Priority Distribution"
            subtitle="Complaint distribution according to AI predicted priority."
            items={
              priorityDistribution
            }
            total={
              complaintStats.total
            }
            itemKey="priority"
            formatLabel={
              formatPriority
            }
          />
        </div>

        {/* =====================================================
            TREND ANALYSIS
        ===================================================== */}

        <DashboardSection
          title="Complaint Trend Analysis"
          subtitle="Monthly complaint volume across the latest six months."
          icon={
            <TrendingUp
              size={22}
            />
          }
          iconStyle="bg-cyan-50 text-cyan-600"
        >
          <div className="overflow-x-auto">
            <div className="flex h-72 min-w-[600px] items-end gap-5 border-b border-l border-slate-200 px-5 pb-4 pt-8">
              {complaintTrend.map(
                (item) => {
                  const height =
                    item.count >
                    0
                      ? Math.max(
                          8,
                          (
                            item.count /
                            maximumTrend
                          ) *
                            100
                        )
                      : 2;

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <p className="mb-2 text-xs font-bold text-slate-600">
                        {
                          item.count
                        }
                      </p>

                      <div
                        className="w-full max-w-16 rounded-t-lg bg-blue-600 transition-all"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        {
                          item.label
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </DashboardSection>

        {/* =====================================================
            DEPARTMENT PERFORMANCE
        ===================================================== */}

        <DashboardSection
          title="Department Performance Monitoring"
          subtitle="Monitor departmental workload, complaint progress and resolution performance."
          icon={
            <Activity
              size={22}
            />
          }
          iconStyle="bg-orange-50 text-orange-600"
        >
          {departmentPerformance.length ===
          0 ? (
            <EmptyState
              icon={
                <Building2
                  size={36}
                />
              }
              title="No departments available"
              description="Department performance information will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4 font-semibold">
                      Department
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Total
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Assigned
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      In Progress
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Resolved
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Resolution Rate
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {departmentPerformance.map(
                    (department) => (
                      <tr
                        key={
                          department.id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-5">
                          <p className="font-bold text-slate-800">
                            {
                              department.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              department.code
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5 font-bold">
                          {
                            department.total
                          }
                        </td>

                        <td className="px-4 py-5">
                          {
                            department.assigned
                          }
                        </td>

                        <td className="px-4 py-5">
                          {
                            department.inProgress
                          }
                        </td>

                        <td className="px-4 py-5">
                          {
                            department.resolved
                          }
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex min-w-40 items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${department.resolutionRate}%`,
                                }}
                              />
                            </div>

                            <span className="text-sm font-bold">
                              {
                                department.resolutionRate
                              }
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>

        {/* =====================================================
            GEOGRAPHICAL ANALYSIS
        ===================================================== */}

        <DashboardSection
          title="Geographical Complaint Analysis"
          subtitle="Visualize complaint locations and identify geographical complaint hotspots."
          icon={
            <MapPinned
              size={22}
            />
          }
          iconStyle="bg-violet-50 text-violet-600"
        >
          <div className="print:hidden mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {
                  mapComplaints.length
                }{" "}
                mapped complaint(s)
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Complaints without GPS coordinates are excluded from the map.
              </p>
            </div>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setMapMode(
                    "markers"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  mapMode ===
                  "markers"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <MapPin
                  size={15}
                />

                Markers
              </button>

              <button
                type="button"
                onClick={() =>
                  setMapMode(
                    "heatmap"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  mapMode ===
                  "heatmap"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Flame
                  size={15}
                />

                Heatmap
              </button>
            </div>
          </div>

          {mapComplaints.length ===
          0 ? (
            <EmptyState
              icon={
                <MapPin
                  size={36}
                />
              }
              title="No mapped complaints available"
              description="Complaints with valid latitude and longitude coordinates will appear here."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="h-[520px] w-full">
                <MapContainer
                  center={
                    SRI_LANKA_CENTER
                  }
                  zoom={8}
                  scrollWheelZoom={
                    true
                  }
                  className="h-full w-full"
                  style={{
                    height:
                      "520px",
                    width:
                      "100%",
                  }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {mapMode ===
                    "markers" &&
                    mapComplaints.map(
                      (complaint) => (
                        <CircleMarker
                          key={
                            complaint._id
                          }
                          center={[
                            complaint.latitude,
                            complaint.longitude,
                          ]}
                          radius={9}
                          pathOptions={{
                            fillOpacity:
                              0.9,
                          }}
                        >
                          <Popup>
                            <div className="min-w-[220px]">
                              <strong>
                                {complaint.title ||
                                  "Complaint"}
                              </strong>

                              <br />

                              Category:{" "}
                              {formatCategory(
                                complaint.category
                              )}

                              <br />

                              Priority:{" "}
                              {formatPriority(
                                complaint.priority
                              )}

                              <br />

                              Status:{" "}
                              {formatStatus(
                                complaint.status
                              )}

                              <br />

                              Location:{" "}
                              {complaint
                                .location
                                ?.address ||
                                "Selected map location"}
                            </div>
                          </Popup>
                        </CircleMarker>
                      )
                    )}

                  {mapMode ===
                    "heatmap" && (
                    <ComplaintHeatmapLayer
                      complaints={
                        mapComplaints
                      }
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          )}
        </DashboardSection>

        {/* =====================================================
            RECENT COMPLAINTS
        ===================================================== */}

        <DashboardSection
          title="Recent Complaints"
          subtitle="Most recent complaints matching the current dashboard filters."
          icon={
            <Clock3
              size={22}
            />
          }
          iconStyle="bg-blue-50 text-blue-600"
        >
          {recentComplaints.length ===
          0 ? (
            <EmptyState
              icon={
                <FileText
                  size={36}
                />
              }
              title="No complaints available"
              description="Recent complaint information will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4 font-semibold">
                      Complaint
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Priority
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-4 font-semibold">
                      Date
                    </th>

                    <th className="print:hidden px-4 py-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentComplaints.map(
                    (complaint) => (
                      <tr
                        key={
                          complaint._id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-5">
                          <p className="max-w-md font-semibold text-slate-800">
                            {
                              complaint.title
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID:{" "}
                            {
                              complaint._id
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5 text-sm text-slate-600">
                          {formatCategory(
                            complaint.category
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <PriorityBadge
                            priority={
                              complaint.priority
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              complaint.status
                            }
                          />
                        </td>

                        <td className="px-4 py-5 text-sm text-slate-500">
                          {formatDate(
                            complaint.createdAt
                          )}
                        </td>

                        <td className="print:hidden px-4 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${complaint._id}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye
                              size={14}
                            />

                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DashboardSection>

        {/* =====================================================
            REPORT GENERATION
        ===================================================== */}

        <DashboardSection
          title="Report Generation"
          subtitle="Generate administrative complaint reports using the currently selected dashboard filters."
          icon={
            <FileSpreadsheet
              size={22}
            />
          }
          iconStyle="bg-emerald-50 text-emerald-600"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <ReportStat
              title="Report Records"
              value={
                filteredComplaints.length
              }
              description="Complaints included under the current filter selection."
            />

            <ReportStat
              title="Resolved"
              value={
                complaintStats.resolved
              }
              description="Resolved complaints included in the report."
            />

            <ReportStat
              title="Resolution Rate"
              value={`${complaintStats.resolutionRate}%`}
              description="Resolved complaint percentage for the report."
            />
          </div>

          <div className="print:hidden mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={
                exportCSV
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Download
                size={18}
              />

              Export CSV Report
            </button>

            <button
              type="button"
              onClick={
                printReport
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Printer
                size={18}
              />

              Print / Save as PDF
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <CalendarDays
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <p className="text-sm leading-6 text-blue-700">
                The report automatically follows the selected
                category, status, priority, department and
                date-range filters. To generate a PDF, select
                <strong> Print / Save as PDF</strong> and then
                choose <strong>Save as PDF</strong> from the
                browser print dialog.
              </p>
            </div>
          </div>
        </DashboardSection>

        {/* =====================================================
            DEPARTMENT ACTIVITY
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">
                Department Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current system departments and assigned
                complaint categories.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/departments"
                )
              }
              className="print:hidden text-left text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Manage Departments
            </button>
          </div>

          {departments.length ===
          0 ? (
            <EmptyState
              icon={
                <Building2
                  size={36}
                />
              }
              title="No departments found"
              description="Departments created by administrators will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">
                      Department
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Code
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Categories
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map(
                    (department) => (
                      <tr
                        key={
                          department._id ||
                          department.id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-800">
                            {department.name ||
                              "Unnamed Department"}
                          </p>

                          {department.description && (
                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                              {
                                department.description
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {department.code ||
                            "-"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex max-w-md flex-wrap gap-2">
                            {Array.isArray(
                              department.categories
                            ) &&
                            department
                              .categories
                              .length >
                              0 ? (
                              department.categories.map(
                                (category) => (
                                  <span
                                    key={
                                      category
                                    }
                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                                  >
                                    {formatCategory(
                                      category
                                    )}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-sm text-slate-400">
                                -
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              department.isActive !==
                              false
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {department.isActive !==
                            false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD SECTION
========================================================= */

function DashboardSection({
  title,
  subtitle,
  icon,
  iconStyle,
  children,
  noMargin = false,
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${
        noMargin
          ? ""
          : "mt-8"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold">
            {title}
          </h2>

          <p className="text-sm text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
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

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   OVERVIEW ITEM
========================================================= */

function OverviewItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xl font-extrabold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
  formatOption,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        <option value="all">
          {allLabel}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {formatOption(
                option
              )}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* =========================================================
   DISTRIBUTION SECTION
========================================================= */

function DistributionSection({
  title,
  subtitle,
  items,
  total,
  itemKey,
  formatLabel,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <BarChart3
            size={22}
          />
        </div>

        <div>
          <h2 className="text-lg font-bold">
            {title}
          </h2>

          <p className="text-sm text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {items.map(
          (item) => {
            const percentage =
              total > 0
                ? Math.round(
                    (
                      item.count /
                      total
                    ) *
                      100
                  )
                : 0;

            return (
              <div
                key={
                  item[
                    itemKey
                  ]
                }
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {formatLabel(
                      item[
                        itemKey
                      ]
                    )}
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {
                      item.count
                    }

                    <span className="ml-2 font-medium text-slate-400">
                      (
                      {
                        percentage
                      }
                      %)
                    </span>
                  </p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

/* =========================================================
   PRIORITY BADGE
========================================================= */

function PriorityBadge({
  priority,
}) {
  const styles = {
    high:
      "bg-red-50 text-red-700",

    medium:
      "bg-amber-50 text-amber-700",

    low:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[
          priority
        ] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {priority
        ? String(
            priority
          )
            .charAt(0)
            .toUpperCase() +
          String(
            priority
          ).slice(1)
        : "-"}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const styles = {
    submitted:
      "bg-blue-50 text-blue-700",

    under_review:
      "bg-cyan-50 text-cyan-700",

    assigned:
      "bg-indigo-50 text-indigo-700",

    in_progress:
      "bg-amber-50 text-amber-700",

    resolved:
      "bg-emerald-50 text-emerald-700",

    rejected:
      "bg-red-50 text-red-700",

    duplicate:
      "bg-purple-50 text-purple-700",
  };

  const label =
    status
      ? String(
          status
        )
          .replace(
            /_/g,
            " "
          )
          .replace(
            /\b\w/g,
            (character) =>
              character.toUpperCase()
          )
      : "-";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[
          status
        ] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}

/* =========================================================
   REPORT STAT
========================================================= */

function ReportStat({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-extrabold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        {icon}
      </div>

      <p className="mt-4 font-bold text-slate-700">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default AdminOverviewPage;