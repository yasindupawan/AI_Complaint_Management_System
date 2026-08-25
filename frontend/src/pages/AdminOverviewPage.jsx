import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "lucide-react";

import { getAllAdminComplaints } from "../api/adminComplaintApi";
import { getUserStatistics } from "../api/adminUserApi";
import { getDepartments } from "../api/departmentApi";

/* =========================================================
   ADMIN OVERVIEW PAGE
========================================================= */

function AdminOverviewPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [userStatistics, setUserStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     GET TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD OVERVIEW DATA
  ========================================================= */

  useEffect(() => {
    const loadOverview = async () => {
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

        const [
          complaintsResponse,
          usersResponse,
          departmentsResponse,
        ] = await Promise.all([
          getAllAdminComplaints(token),
          getUserStatistics(token),
          getDepartments(token),
        ]);

        setComplaints(
          Array.isArray(complaintsResponse?.complaints)
            ? complaintsResponse.complaints
            : []
        );

        setUserStatistics(
          usersResponse?.statistics || null
        );

        setDepartments(
          Array.isArray(departmentsResponse?.departments)
            ? departmentsResponse.departments
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
          err?.message?.toLowerCase() || "";

        if (
          message.includes("token") ||
          message.includes("unauthorized") ||
          message.includes("not authorized")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [navigate]);

  /* =========================================================
     COMPLAINT STATISTICS
  ========================================================= */

  const complaintStats = useMemo(() => {
    const total = complaints.length;

    const submitted = complaints.filter(
      (complaint) =>
        complaint.status === "submitted"
    ).length;

    const assigned = complaints.filter(
      (complaint) =>
        complaint.status === "assigned"
    ).length;

    const inProgress = complaints.filter(
      (complaint) =>
        complaint.status === "in_progress"
    ).length;

    const resolved = complaints.filter(
      (complaint) =>
        complaint.status === "resolved"
    ).length;

    const rejected = complaints.filter(
      (complaint) =>
        complaint.status === "rejected"
    ).length;

    const duplicate = complaints.filter(
      (complaint) =>
        complaint.status === "duplicate"
    ).length;

    const resolutionRate =
      total > 0
        ? Math.round(
            (resolved / total) * 100
          )
        : 0;

    return {
      total,
      submitted,
      assigned,
      inProgress,
      resolved,
      rejected,
      duplicate,
      resolutionRate,
    };
  }, [complaints]);

  /* =========================================================
     USER STATISTICS
  ========================================================= */

  const users = {
    total:
      userStatistics?.totalUsers ?? 0,

    citizens:
      userStatistics?.totalCitizens ?? 0,

    officers:
      userStatistics?.totalOfficers ?? 0,

    admins:
      userStatistics?.totalAdmins ?? 0,

    active:
      userStatistics?.activeUsers ?? 0,

    inactive:
      userStatistics?.inactiveUsers ?? 0,
  };

  /* =========================================================
     DEPARTMENT STATISTICS
  ========================================================= */

  const departmentStats = useMemo(() => {
    const total = departments.length;

    const active = departments.filter(
      (department) =>
        department.isActive !== false
    ).length;

    const inactive = departments.filter(
      (department) =>
        department.isActive === false
    ).length;

    return {
      total,
      active,
      inactive,
    };
  }, [departments]);

  /* =========================================================
     CATEGORY DISTRIBUTION
  ========================================================= */

  const categoryDistribution = useMemo(() => {
    const categories = [
      "roads",
      "water_supply",
      "electricity",
      "drainage",
      "garbage",
      "environment",
    ];

    return categories.map((category) => ({
      category,

      count: complaints.filter(
        (complaint) =>
          complaint.category === category
      ).length,
    }));
  }, [complaints]);

  /* =========================================================
     FORMAT CATEGORY
  ========================================================= */

  const formatCategory = (category) => {
    if (!category) {
      return "-";
    }

    return category
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
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
            navigate("/admin/dashboard")
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />

          Back to Admin Dashboard
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6">
          <p className="text-sm font-semibold text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            System Overview
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Monitor complaint activity, user participation,
            department operations and overall complaint
            processing performance across the system.
          </p>
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

            <p>{error}</p>
          </div>
        )}

        {/* =====================================================
            MAIN STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Complaints"
            value={complaintStats.total}
            icon={<FileText size={22} />}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="In Progress"
            value={complaintStats.inProgress}
            icon={<Clock3 size={22} />}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Resolved"
            value={complaintStats.resolved}
            icon={<CheckCircle2 size={22} />}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Resolution Rate"
            value={`${complaintStats.resolutionRate}%`}
            icon={<BarChart3 size={22} />}
            iconStyle="bg-violet-50 text-violet-600"
          />
        </section>

        {/* =====================================================
            COMPLAINT PROCESSING OVERVIEW
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers3 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Complaint Processing Overview
              </h2>

              <p className="text-sm text-slate-500">
                Current complaint status distribution.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MiniStat
              title="Submitted"
              value={complaintStats.submitted}
            />

            <MiniStat
              title="Assigned"
              value={complaintStats.assigned}
            />

            <MiniStat
              title="In Progress"
              value={complaintStats.inProgress}
            />

            <MiniStat
              title="Resolved"
              value={complaintStats.resolved}
            />

            <MiniStat
              title="Rejected"
              value={complaintStats.rejected}
            />

            <MiniStat
              title="Duplicates"
              value={complaintStats.duplicate}
            />
          </div>
        </section>

        {/* =====================================================
            USERS + DEPARTMENTS
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">

          {/* =================================================
              USER OVERVIEW
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  User Overview
                </h2>

                <p className="text-sm text-slate-500">
                  Registered citizens, officers and account status.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <OverviewItem
                icon={<Users size={18} />}
                label="Total Users"
                value={users.total}
              />

              <OverviewItem
                icon={<Users size={18} />}
                label="Citizens"
                value={users.citizens}
              />

              <OverviewItem
                icon={<ShieldCheck size={18} />}
                label="Officers"
                value={users.officers}
              />

              <OverviewItem
                icon={<ShieldCheck size={18} />}
                label="Administrators"
                value={users.admins}
              />

              <OverviewItem
                icon={<UserCheck size={18} />}
                label="Active Users"
                value={users.active}
              />

              <OverviewItem
                icon={<UserX size={18} />}
                label="Inactive Users"
                value={users.inactive}
              />
            </div>
          </section>

          {/* =================================================
              DEPARTMENT OVERVIEW
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Department Overview
                </h2>

                <p className="text-sm text-slate-500">
                  Complaint processing department information.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <OverviewItem
                icon={<Building2 size={18} />}
                label="Total Departments"
                value={departmentStats.total}
              />

              <OverviewItem
                icon={<CheckCircle2 size={18} />}
                label="Active Departments"
                value={departmentStats.active}
              />

              <OverviewItem
                icon={<AlertCircle size={18} />}
                label="Inactive Departments"
                value={departmentStats.inactive}
              />

              <OverviewItem
                icon={<Users size={18} />}
                label="Total Officers"
                value={users.officers}
              />
            </div>
          </section>
        </div>

        {/* =====================================================
            CATEGORY DISTRIBUTION
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BarChart3 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Complaint Category Distribution
              </h2>

              <p className="text-sm text-slate-500">
                Total complaints received under each
                AI classification category.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {categoryDistribution.map(
              (item) => {
                const percentage =
                  complaintStats.total > 0
                    ? Math.round(
                        (item.count /
                          complaintStats.total) *
                          100
                      )
                    : 0;

                return (
                  <div key={item.category}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {formatCategory(
                          item.category
                        )}
                      </p>

                      <p className="text-sm font-bold text-slate-900">
                        {item.count}

                        <span className="ml-2 font-medium text-slate-400">
                          ({percentage}%)
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
                navigate("/admin/departments")
              }
              className="text-left text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Manage Departments
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="p-10 text-center">
              <Building2
                size={38}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-700">
                No departments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Departments created by administrators will
                appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
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
                              {department.description}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {department.code || "-"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex max-w-md flex-wrap gap-2">
                            {Array.isArray(
                              department.categories
                            ) &&
                            department.categories.length >
                              0 ? (
                              department.categories.map(
                                (category) => (
                                  <span
                                    key={category}
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

export default AdminOverviewPage;