import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Users,
  UserRound,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Building2,
  Mail,
  Languages,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Save,
  UserCog,
} from "lucide-react";

import {
  getAllUsers,
  createOfficer,
  updateUserStatus,
  updateOfficerDepartment,
  getUserStatistics,
  deleteUser,
} from "../api/adminUserApi";

import {
  getDepartments,
} from "../api/departmentApi";

/* =========================================================
   ADMIN USERS PAGE
========================================================= */

function AdminUsersPage() {
  const navigate = useNavigate();

  /* =========================================================
     MAIN STATES
  ========================================================= */

  const [activeTab, setActiveTab] =
    useState("citizens");

  const [users, setUsers] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [statistics, setStatistics] =
    useState({
      totalUsers: 0,
      totalCitizens: 0,
      totalOfficers: 0,
      totalAdmins: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      activeCitizens: 0,
      inactiveCitizens: 0,
      activeOfficers: 0,
      inactiveOfficers: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================================
     FILTER STATES
  ========================================================= */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [departmentFilter, setDepartmentFilter] =
    useState("all");

  /* =========================================================
     CREATE OFFICER MODAL
  ========================================================= */

  const [showCreateOfficer, setShowCreateOfficer] =
    useState(false);

  const [creatingOfficer, setCreatingOfficer] =
    useState(false);

  const [createOfficerError, setCreateOfficerError] =
    useState("");

  const [officerForm, setOfficerForm] =
    useState({
      fullName: "",
      email: "",
      password: "",
      department: "",
      preferredLanguage: "english",
    });

  /* =========================================================
     DEPARTMENT CHANGE MODAL
  ========================================================= */

  const [
    departmentChangeUser,
    setDepartmentChangeUser,
  ] = useState(null);

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("");

  const [
    changingDepartment,
    setChangingDepartment,
  ] = useState(false);

  /* =========================================================
     DELETE MODAL
  ========================================================= */

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deletingUser, setDeletingUser] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  /* =========================================================
     STATUS UPDATE
  ========================================================= */

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  /* =========================================================
     TOKEN
  ========================================================= */

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD USERS
  ========================================================= */

  const loadUsers = async () => {
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
        await getAllUsers(token);

      setUsers(
        Array.isArray(response?.users)
          ? response.users
          : []
      );
    } catch (err) {
      console.error(
        "Admin users loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD STATISTICS
  ========================================================= */

  const loadStatistics = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response =
        await getUserStatistics(token);

      if (response?.statistics) {
        setStatistics(
          response.statistics
        );
      }
    } catch (err) {
      console.error(
        "User statistics loading error:",
        err
      );
    }
  };

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  const loadDepartments = async () => {
    try {
      const token = getToken();

      if (!token) {
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
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadUsers();
    loadStatistics();
    loadDepartments();
  }, []);

  /* =========================================================
     FILTER USERS
  ========================================================= */

  const filteredUsers = useMemo(() => {
    const targetRole =
      activeTab === "citizens"
        ? "citizen"
        : "officer";

    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase();

    return users.filter((user) => {
      if (user.role !== targetRole) {
        return false;
      }

      const matchesSearch =
        !normalizedSearch ||
        user.fullName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user._id
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.isActive) ||
        (statusFilter === "inactive" &&
          !user.isActive);

      const matchesDepartment =
        activeTab !== "officers" ||
        departmentFilter === "all" ||
        user.department?._id ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    users,
    activeTab,
    searchTerm,
    statusFilter,
    departmentFilter,
  ]);

  /* =========================================================
     TAB CHANGE
  ========================================================= */

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");

    setError("");
    setSuccessMessage("");
  };

  /* =========================================================
     CREATE OFFICER FORM CHANGE
  ========================================================= */

  const handleOfficerFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setOfficerForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setCreateOfficerError("");
  };

  /* =========================================================
     CREATE OFFICER
  ========================================================= */

  const handleCreateOfficer = async (
    event
  ) => {
    event.preventDefault();

    try {
      setCreateOfficerError("");
      setSuccessMessage("");

      if (
        !officerForm.fullName.trim()
      ) {
        setCreateOfficerError(
          "Officer name is required."
        );

        return;
      }

      if (!officerForm.email.trim()) {
        setCreateOfficerError(
          "Officer email is required."
        );

        return;
      }

      if (
        officerForm.password.length < 6
      ) {
        setCreateOfficerError(
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (!officerForm.department) {
        setCreateOfficerError(
          "Please select a department."
        );

        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      setCreatingOfficer(true);

      const response =
        await createOfficer(
          {
            fullName:
              officerForm.fullName.trim(),

            email:
              officerForm.email
                .trim()
                .toLowerCase(),

            password:
              officerForm.password,

            department:
              officerForm.department,

            preferredLanguage:
              officerForm.preferredLanguage,
          },
          token
        );

      setSuccessMessage(
        response?.message ||
          "Officer account created successfully."
      );

      setOfficerForm({
        fullName: "",
        email: "",
        password: "",
        department: "",
        preferredLanguage: "english",
      });

      setShowCreateOfficer(false);

      await Promise.all([
        loadUsers(),
        loadStatistics(),
      ]);
    } catch (err) {
      console.error(
        "Create officer error:",
        err
      );

      if (
        Array.isArray(err?.errors) &&
        err.errors.length > 0
      ) {
        setCreateOfficerError(
          err.errors
            .map(
              (item) =>
                item.msg ||
                item.message
            )
            .join(" ")
        );
      } else {
        setCreateOfficerError(
          err?.message ||
            "Unable to create officer account."
        );
      }
    } finally {
      setCreatingOfficer(false);
    }
  };

  /* =========================================================
     ACTIVATE / DEACTIVATE USER
  ========================================================= */

  const handleToggleStatus = async (
    user
  ) => {
    try {
      setError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      setStatusUpdatingId(
        user._id
      );

      const newStatus =
        !user.isActive;

      const response =
        await updateUserStatus(
          user._id,
          newStatus,
          token
        );

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? response?.user || {
                ...item,
                isActive: newStatus,
              }
            : item
        )
      );

      setSuccessMessage(
        response?.message ||
          "User account status updated successfully."
      );

      await loadStatistics();
    } catch (err) {
      console.error(
        "User status update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update user status."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* =========================================================
     OPEN DEPARTMENT CHANGE MODAL
  ========================================================= */

  const openDepartmentChangeModal = (
    user
  ) => {
    setDepartmentChangeUser(user);

    setSelectedDepartment(
      user.department?._id || ""
    );

    setError("");
    setSuccessMessage("");
  };

  /* =========================================================
     UPDATE OFFICER DEPARTMENT
  ========================================================= */

  const handleDepartmentChange =
    async () => {
      try {
        setError("");
        setSuccessMessage("");

        if (
          !departmentChangeUser
        ) {
          return;
        }

        if (!selectedDepartment) {
          setError(
            "Please select a department."
          );

          return;
        }

        if (
          selectedDepartment ===
          departmentChangeUser
            .department?._id
        ) {
          setError(
            "Please select a different department."
          );

          return;
        }

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        setChangingDepartment(
          true
        );

        const response =
          await updateOfficerDepartment(
            departmentChangeUser._id,
            selectedDepartment,
            token
          );

        setUsers((previous) =>
          previous.map((item) =>
            item._id ===
            departmentChangeUser._id
              ? response?.user ||
                item
              : item
          )
        );

        setSuccessMessage(
          response?.message ||
            "Officer department updated successfully."
        );

        setDepartmentChangeUser(
          null
        );

        setSelectedDepartment(
          ""
        );
      } catch (err) {
        console.error(
          "Officer department update error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update officer department."
        );
      } finally {
        setChangingDepartment(
          false
        );
      }
    };

  /* =========================================================
     DELETE USER
  ========================================================= */

  const handleDeleteUser = async () => {
    try {
      if (!deleteTarget) {
        return;
      }

      setDeletingUser(true);
      setDeleteError("");
      setError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await deleteUser(
          deleteTarget._id,
          token
        );

      setUsers((previous) =>
        previous.filter(
          (user) =>
            user._id !==
            deleteTarget._id
        )
      );

      setSuccessMessage(
        response?.message ||
          "User removed successfully."
      );

      setDeleteTarget(null);

      await loadStatistics();
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setDeleteError(
        err?.message ||
          "Unable to remove this user."
      );
    } finally {
      setDeletingUser(false);
    }
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
     FORMAT LANGUAGE
  ========================================================= */

  const formatLanguage = (
    language
  ) => {
    if (!language) {
      return "-";
    }

    return (
      language
        .charAt(0)
        .toUpperCase() +
      language.slice(1)
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
              size={38}
              className="mx-auto animate-spin text-[#1F5F8B]"
            />

            <p className="mt-4 text-sm font-semibold text-[#60798C]">
              Loading user management...
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
              "/admin/dashboard"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft size={17} />

          Back to Admin Dashboard
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <p className="text-sm font-semibold text-[#1B8A8F]">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#16324A] sm:text-4xl">
              User Management
            </h1>

            <p className="mt-2 max-w-2xl text-[#60798C]">
              Manage registered citizens and system officers,
              control account access and maintain officer
              department assignments.
            </p>
          </div>

          {activeTab ===
            "officers" && (
            <button
              type="button"
              onClick={() => {
                setCreateOfficerError(
                  ""
                );

                setShowCreateOfficer(
                  true
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#174D72]"
            >
              <UserPlus size={18} />

              Add Officer
            </button>
          )}

        </section>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {successMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            {successMessage}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            {error}
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Citizens"
            value={
              statistics.totalCitizens ||
              0
            }
            subText={`${statistics.activeCitizens || 0} active`}
            icon={
              <UserRound
                size={22}
              />
            }
            iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
          />

          <StatCard
            title="Active Citizens"
            value={
              statistics.activeCitizens ||
              0
            }
            subText={`${statistics.inactiveCitizens || 0} inactive`}
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Officers"
            value={
              statistics.totalOfficers ||
              0
            }
            subText={`${statistics.activeOfficers || 0} active`}
            icon={
              <ShieldCheck
                size={22}
              />
            }
            iconStyle="bg-[#E8F6F4] text-[#1B8A8F]"
          />

          <StatCard
            title="Active Officers"
            value={
              statistics.activeOfficers ||
              0
            }
            subText={`${statistics.inactiveOfficers || 0} inactive`}
            icon={
              <UserCog
                size={22}
              />
            }
            iconStyle="bg-[#EAF3F8] text-[#1F5F8B]"
          />

        </section>

        {/* =====================================================
            CITIZEN / OFFICER TABS
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-[#D8E5EC] bg-white p-2 shadow-sm">

          <div className="grid grid-cols-2 gap-2">

            <button
              type="button"
              onClick={() =>
                handleTabChange(
                  "citizens"
                )
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                activeTab ===
                "citizens"
                  ? "bg-[#1F5F8B] text-white shadow-sm"
                  : "text-[#60798C] hover:bg-[#EAF3F8] hover:text-[#1F5F8B]"
              }`}
            >
              <UserRound size={18} />

              Citizens
            </button>

            <button
              type="button"
              onClick={() =>
                handleTabChange(
                  "officers"
                )
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                activeTab ===
                "officers"
                  ? "bg-[#1B8A8F] text-white shadow-sm"
                  : "text-[#60798C] hover:bg-[#E8F6F4] hover:text-[#1B8A8F]"
              }`}
            >
              <ShieldCheck
                size={18}
              />

              Officers
            </button>

          </div>

        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-6 rounded-2xl border border-[#D8E5EC] bg-white p-5 shadow-sm">

          <div
            className={`grid gap-4 ${
              activeTab ===
              "officers"
                ? "lg:grid-cols-[1.5fr_1fr_1fr]"
                : "lg:grid-cols-[1.5fr_1fr]"
            }`}
          >

            {/* SEARCH */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target
                      .value
                  )
                }
                placeholder={
                  activeTab ===
                  "citizens"
                    ? "Search citizen name, email or ID..."
                    : "Search officer name, email or ID..."
                }
                className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              />

            </div>

            {/* STATUS */}

            <div className="relative">

              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
              />

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value
                  )
                }
                className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3 pl-11 pr-4 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

            </div>

            {/* DEPARTMENT FILTER */}

            {activeTab ===
              "officers" && (
              <select
                value={
                  departmentFilter
                }
                onChange={(
                  event
                ) =>
                  setDepartmentFilter(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#425D70] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              >
                <option value="all">
                  All Departments
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
                      {
                        department.name
                      }

                      {department.code
                        ? ` (${department.code})`
                        : ""}
                    </option>
                  )
                )}
              </select>
            )}

          </div>

          <div className="mt-4 rounded-xl bg-[#F6F9FB] px-4 py-3">

            <p className="text-sm text-[#60798C]">
              Showing{" "}
              <span className="font-bold text-[#16324A]">
                {
                  filteredUsers.length
                }
              </span>{" "}
              {activeTab ===
              "citizens"
                ? "citizens"
                : "officers"}
            </p>

          </div>

        </section>

        {/* =====================================================
            USER LIST
        ===================================================== */}

        <section className="mt-6">

          {filteredUsers.length ===
          0 ? (
            <div className="rounded-2xl border border-[#D8E5EC] bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#8A9EAC]">
                <Users
                  size={34}
                />
              </div>

              <p className="mt-4 font-bold text-[#16324A]">
                No{" "}
                {activeTab ===
                "citizens"
                  ? "citizens"
                  : "officers"}{" "}
                found
              </p>

              <p className="mt-1 text-sm text-[#60798C]">
                No users match the
                current search or
                filters.
              </p>

            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#D8E5EC] bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-[#D8E5EC]">

                  <thead className="bg-[#F6F9FB]">
                    <tr>

                      <TableHeader>
                        User
                      </TableHeader>

                      {activeTab ===
                        "officers" && (
                        <TableHeader>
                          Department
                        </TableHeader>
                      )}

                      <TableHeader>
                        Language
                      </TableHeader>

                      <TableHeader>
                        Joined
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader align="right">
                        Actions
                      </TableHeader>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3F6]">

                    {filteredUsers.map(
                      (user) => (
                        <tr
                          key={
                            user._id
                          }
                          className="transition hover:bg-[#F8FBFC]"
                        >

                          {/* USER */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3F8] font-bold text-[#1F5F8B]">
                                {user.fullName
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "U"}
                              </div>

                              <div className="min-w-0">

                                <p className="font-bold text-[#16324A]">
                                  {
                                    user.fullName
                                  }
                                </p>

                                <p className="mt-1 flex items-center gap-1 text-xs text-[#60798C]">
                                  <Mail
                                    size={
                                      13
                                    }
                                    className="text-[#1B8A8F]"
                                  />

                                  {
                                    user.email
                                  }
                                </p>

                                <p className="mt-1 max-w-[260px] truncate text-[11px] text-[#8A9EAC]">
                                  ID:{" "}
                                  {
                                    user._id
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          {activeTab ===
                            "officers" && (
                            <td className="px-5 py-5">

                              <div className="flex items-center gap-2 text-sm font-semibold text-[#425D70]">

                                <Building2
                                  size={
                                    16
                                  }
                                  className="text-[#1B8A8F]"
                                />

                                {user
                                  .department
                                  ?.name ||
                                  "Not Assigned"}

                              </div>

                              {user
                                .department
                                ?.code && (
                                <p className="mt-1 text-xs text-[#8A9EAC]">
                                  {
                                    user
                                      .department
                                      .code
                                  }
                                </p>
                              )}

                            </td>
                          )}

                          {/* LANGUAGE */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-2 text-sm font-medium text-[#60798C]">

                              <Languages
                                size={
                                  16
                                }
                                className="text-[#1B8A8F]"
                              />

                              {formatLanguage(
                                user.preferredLanguage
                              )}

                            </div>

                          </td>

                          {/* CREATED */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-2 text-sm text-[#60798C]">

                              <CalendarDays
                                size={
                                  16
                                }
                                className="text-[#1F5F8B]"
                              />

                              {formatDate(
                                user.createdAt
                              )}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5">

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                user.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >

                              {user.isActive ? (
                                <CheckCircle2
                                  size={
                                    13
                                  }
                                />
                              ) : (
                                <XCircle
                                  size={
                                    13
                                  }
                                />
                              )}

                              {user.isActive
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-5">

                            <div className="flex justify-end gap-2">

                              {/* DEPARTMENT CHANGE */}

                              {activeTab ===
                                "officers" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDepartmentChangeModal(
                                      user
                                    )
                                  }
                                  title="Change Department"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8E5EC] text-[#60798C] transition hover:border-[#8FC6CC] hover:bg-[#E8F6F4] hover:text-[#1B8A8F]"
                                >
                                  <Building2
                                    size={
                                      16
                                    }
                                  />
                                </button>
                              )}

                              {/* ACTIVATE / DEACTIVATE */}

                              <button
                                type="button"
                                disabled={
                                  statusUpdatingId ===
                                  user._id
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    user
                                  )
                                }
                                title={
                                  user.isActive
                                    ? "Deactivate Account"
                                    : "Activate Account"
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  user.isActive
                                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {statusUpdatingId ===
                                user._id ? (
                                  <Loader2
                                    size={
                                      16
                                    }
                                    className="animate-spin"
                                  />
                                ) : user.isActive ? (
                                  <XCircle
                                    size={
                                      16
                                    }
                                  />
                                ) : (
                                  <CheckCircle2
                                    size={
                                      16
                                    }
                                  />
                                )}
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(
                                    ""
                                  );

                                  setDeleteTarget(
                                    user
                                  );
                                }}
                                title="Remove User"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          CREATE OFFICER MODAL
      ===================================================== */}

      {showCreateOfficer && (
        <ModalOverlay>

          <div className="w-full max-w-lg rounded-2xl border border-[#D8E5EC] bg-white shadow-2xl">

            <ModalHeader
              title="Add New Officer"
              description="Create an officer account and assign the officer to a department."
              onClose={() =>
                !creatingOfficer &&
                setShowCreateOfficer(
                  false
                )
              }
            />

            <form
              onSubmit={
                handleCreateOfficer
              }
              className="space-y-5 p-6"
            >

              {createOfficerError && (
                <ErrorBox
                  message={
                    createOfficerError
                  }
                />
              )}

              <FormField
                label="Full Name"
                name="fullName"
                value={
                  officerForm.fullName
                }
                onChange={
                  handleOfficerFormChange
                }
                placeholder="Enter officer full name"
                disabled={
                  creatingOfficer
                }
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={
                  officerForm.email
                }
                onChange={
                  handleOfficerFormChange
                }
                placeholder="Enter officer email"
                disabled={
                  creatingOfficer
                }
              />

              <FormField
                label="Temporary Password"
                name="password"
                type="password"
                value={
                  officerForm.password
                }
                onChange={
                  handleOfficerFormChange
                }
                placeholder="Minimum 6 characters"
                disabled={
                  creatingOfficer
                }
              />

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                  Department
                </label>

                <select
                  name="department"
                  value={
                    officerForm.department
                  }
                  onChange={
                    handleOfficerFormChange
                  }
                  disabled={
                    creatingOfficer
                  }
                  className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                >
                  <option value="">
                    Select department
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
                        {
                          department.name
                        }

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
                  Preferred Language
                </label>

                <select
                  name="preferredLanguage"
                  value={
                    officerForm.preferredLanguage
                  }
                  onChange={
                    handleOfficerFormChange
                  }
                  disabled={
                    creatingOfficer
                  }
                  className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                >
                  <option value="english">
                    English
                  </option>

                  <option value="sinhala">
                    Sinhala
                  </option>

                  <option value="tamil">
                    Tamil
                  </option>
                </select>

              </div>

              <div className="flex justify-end gap-3 border-t border-[#EDF3F6] pt-5">

                <button
                  type="button"
                  disabled={
                    creatingOfficer
                  }
                  onClick={() =>
                    setShowCreateOfficer(
                      false
                    )
                  }
                  className="rounded-xl border border-[#C8D8E2] px-5 py-3 text-sm font-bold text-[#60798C] transition hover:bg-[#F6F9FB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingOfficer
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174D72] disabled:opacity-50"
                >
                  {creatingOfficer ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <UserPlus
                      size={17}
                    />
                  )}

                  {creatingOfficer
                    ? "Creating..."
                    : "Create Officer"}
                </button>

              </div>

            </form>

          </div>

        </ModalOverlay>
      )}

      {/* =====================================================
          CHANGE DEPARTMENT MODAL
      ===================================================== */}

      {departmentChangeUser && (
        <ModalOverlay>

          <div className="w-full max-w-md rounded-2xl border border-[#D8E5EC] bg-white shadow-2xl">

            <ModalHeader
              title="Change Department"
              description={
                departmentChangeUser.fullName
              }
              onClose={() =>
                !changingDepartment &&
                setDepartmentChangeUser(
                  null
                )
              }
            />

            <div className="p-6">

              <label className="mb-2 block text-sm font-semibold text-[#425D70]">
                New Department
              </label>

              <select
                value={
                  selectedDepartment
                }
                onChange={(
                  event
                ) => {
                  setSelectedDepartment(
                    event.target.value
                  );

                  setError("");
                }}
                disabled={
                  changingDepartment
                }
                className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
              >
                <option value="">
                  Select department
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
                      {
                        department.name
                      }
                    </option>
                  )
                )}
              </select>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={
                    changingDepartment
                  }
                  onClick={() =>
                    setDepartmentChangeUser(
                      null
                    )
                  }
                  className="rounded-xl border border-[#C8D8E2] px-5 py-3 text-sm font-bold text-[#60798C] transition hover:bg-[#F6F9FB]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDepartmentChange
                  }
                  disabled={
                    changingDepartment
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1B8A8F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#157277] disabled:opacity-50"
                >
                  {changingDepartment ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  Save Department
                </button>

              </div>

            </div>

          </div>

        </ModalOverlay>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteTarget && (
        <ModalOverlay>

          <div className="w-full max-w-md rounded-2xl border border-[#D8E5EC] bg-white shadow-2xl">

            <div className="p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#16324A]">
                Remove{" "}
                {deleteTarget.role ===
                "officer"
                  ? "Officer"
                  : "Citizen"}
                ?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#60798C]">
                You are about to permanently remove{" "}
                <span className="font-bold text-[#16324A]">
                  {
                    deleteTarget.fullName
                  }
                </span>
                . This action cannot be undone.
              </p>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-700">
                  If this account is linked to complaint or
                  status-history records, permanent deletion
                  will be blocked. Deactivate the account
                  instead.
                </p>
              </div>

              {deleteError && (
                <div className="mt-4">
                  <ErrorBox
                    message={
                      deleteError
                    }
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={
                    deletingUser
                  }
                  onClick={() =>
                    setDeleteTarget(
                      null
                    )
                  }
                  className="rounded-xl border border-[#C8D8E2] px-5 py-3 text-sm font-bold text-[#60798C] transition hover:bg-[#F6F9FB]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    deletingUser
                  }
                  onClick={
                    handleDeleteUser
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingUser ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2
                      size={17}
                    />
                  )}

                  {deletingUser
                    ? "Removing..."
                    : "Remove User"}
                </button>

              </div>

            </div>

          </div>

        </ModalOverlay>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subText,
  icon,
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

      <p className="mt-4 text-sm font-bold text-[#425D70]">
        {title}
      </p>

      <p className="mt-1 text-xs text-[#8A9EAC]">
        {subText}
      </p>

    </div>
  );
}

/* =========================================================
   TABLE HEADER
========================================================= */

function TableHeader({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#8A9EAC] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0E2C43]/55 p-5 backdrop-blur-sm">
      {children}
    </div>
  );
}

/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  title,
  description,
  onClose,
}) {
  return (
    <div className="flex items-start justify-between border-b border-[#EDF3F6] p-6">

      <div>

        <h2 className="text-xl font-bold text-[#16324A]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[#60798C]">
            {description}
          </p>
        )}

      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A9EAC] transition hover:bg-[#E8F6F4] hover:text-[#1B8A8F]"
      >
        <X size={19} />
      </button>

    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-[#425D70]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#C8D8E2] bg-white px-4 py-3 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
      />

    </div>
  );
}

/* =========================================================
   ERROR BOX
========================================================= */

function ErrorBox({
  message,
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">

      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0"
      />

      <p>
        {message}
      </p>

    </div>
  );
}

export default AdminUsersPage;