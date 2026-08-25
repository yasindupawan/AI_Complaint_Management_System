import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
  Tag,
} from "lucide-react";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
} from "../api/departmentApi";

/* =========================================================
   ADMIN DEPARTMENTS PAGE
========================================================= */

function AdminDepartmentsPage() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDepartmentModal, setShowDepartmentModal] =
    useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [savingDepartment, setSavingDepartment] =
    useState(false);

  const [formError, setFormError] = useState("");

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    categories: "",
  });

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  const loadDepartments = async () => {
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

      setError(
        err?.message ||
          "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  /* =========================================================
     FILTERED DEPARTMENTS
  ========================================================= */

  const filteredDepartments = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !normalizedSearch ||
        department.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        department.code
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        department.categories?.some((category) =>
          category
            ?.toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          department.isActive) ||
        (statusFilter === "inactive" &&
          !department.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    departments,
    searchTerm,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalDepartments =
    departments.length;

  const activeDepartments =
    departments.filter(
      (department) =>
        department.isActive
    ).length;

  const inactiveDepartments =
    departments.filter(
      (department) =>
        !department.isActive
    ).length;

  const totalCategories =
    departments.reduce(
      (total, department) =>
        total +
        (Array.isArray(
          department.categories
        )
          ? department.categories.length
          : 0),
      0
    );

  /* =========================================================
     OPEN CREATE MODAL
  ========================================================= */

  const openCreateModal = () => {
    setEditingDepartment(null);

    setDepartmentForm({
      name: "",
      code: "",
      categories: "",
    });

    setFormError("");
    setSuccessMessage("");

    setShowDepartmentModal(true);
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (
    department
  ) => {
    setEditingDepartment(
      department
    );

    setDepartmentForm({
      name:
        department.name || "",

      code:
        department.code || "",

      categories:
        Array.isArray(
          department.categories
        )
          ? department.categories.join(
              ", "
            )
          : "",
    });

    setFormError("");
    setSuccessMessage("");

    setShowDepartmentModal(true);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setDepartmentForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setFormError("");
  };

  /* =========================================================
     SAVE DEPARTMENT
  ========================================================= */

  const handleSaveDepartment =
    async (event) => {
      event.preventDefault();

      try {
        setFormError("");
        setSuccessMessage("");

        if (
          !departmentForm.name.trim()
        ) {
          setFormError(
            "Department name is required."
          );

          return;
        }

        if (
          !departmentForm.code.trim()
        ) {
          setFormError(
            "Department code is required."
          );

          return;
        }

        const categories =
          departmentForm.categories
            .split(",")
            .map((category) =>
              category
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
            )
            .filter(Boolean);

        if (
          categories.length === 0
        ) {
          setFormError(
            "Please add at least one complaint category."
          );

          return;
        }

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        setSavingDepartment(
          true
        );

        const payload = {
          name:
            departmentForm.name.trim(),

          code:
            departmentForm.code
              .trim()
              .toUpperCase(),

          categories,
        };

        let response;

        if (editingDepartment) {
          response =
            await updateDepartment(
              editingDepartment._id,
              payload,
              token
            );
        } else {
          response =
            await createDepartment(
              payload,
              token
            );
        }

        setSuccessMessage(
          response?.message ||
            (editingDepartment
              ? "Department updated successfully."
              : "Department created successfully.")
        );

        setShowDepartmentModal(
          false
        );

        setEditingDepartment(
          null
        );

        setDepartmentForm({
          name: "",
          code: "",
          categories: "",
        });

        await loadDepartments();
      } catch (err) {
        console.error(
          "Save department error:",
          err
        );

        if (
          Array.isArray(
            err?.errors
          ) &&
          err.errors.length > 0
        ) {
          setFormError(
            err.errors
              .map(
                (item) =>
                  item.msg ||
                  item.message
              )
              .join(" ")
          );
        } else {
          setFormError(
            err?.message ||
              "Unable to save department."
          );
        }
      } finally {
        setSavingDepartment(
          false
        );
      }
    };

  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus =
    async (department) => {
      try {
        setError("");
        setSuccessMessage("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        setStatusUpdatingId(
          department._id
        );

        const newStatus =
          !department.isActive;

        const response =
          await updateDepartmentStatus(
            department._id,
            newStatus,
            token
          );

        setDepartments(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                department._id
                  ? response?.department ||
                    {
                      ...item,
                      isActive:
                        newStatus,
                    }
                  : item
            )
        );

        setSuccessMessage(
          response?.message ||
            "Department status updated successfully."
        );
      } catch (err) {
        console.error(
          "Department status update error:",
          err
        );

        setError(
          err?.message ||
            "Unable to update department status."
        );
      } finally {
        setStatusUpdatingId(
          null
        );
      }
    };

  /* =========================================================
     DELETE DEPARTMENT
  ========================================================= */

  const handleDeleteDepartment =
    async () => {
      try {
        if (!deleteTarget) {
          return;
        }

        setDeleting(true);
        setDeleteError("");
        setSuccessMessage("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response =
          await deleteDepartment(
            deleteTarget._id,
            token
          );

        setDepartments(
          (previous) =>
            previous.filter(
              (department) =>
                department._id !==
                deleteTarget._id
            )
        );

        setSuccessMessage(
          response?.message ||
            "Department removed successfully."
        );

        setDeleteTarget(null);
      } catch (err) {
        console.error(
          "Delete department error:",
          err
        );

        setDeleteError(
          err?.message ||
            "Unable to remove department."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =========================================================
     FORMAT CATEGORY
  ========================================================= */

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
              Loading departments...
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />

          Back to Admin Dashboard
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Department Management
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Manage complaint routing departments,
              assigned categories and department availability.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Add Department
          </button>
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
            title="Total Departments"
            value={
              totalDepartments
            }
            icon={
              <Building2
                size={22}
              />
            }
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Departments"
            value={
              activeDepartments
            }
            icon={
              <CheckCircle2
                size={22}
              />
            }
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Inactive Departments"
            value={
              inactiveDepartments
            }
            icon={
              <XCircle
                size={22}
              />
            }
            iconStyle="bg-red-50 text-red-600"
          />

          <StatCard
            title="Routing Categories"
            value={
              totalCategories
            }
            icon={
              <Tag size={22} />
            }
            iconStyle="bg-violet-50 text-violet-600"
          />
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  searchTerm
                }
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target
                      .value
                  )
                }
                placeholder="Search department, code or category..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {
                filteredDepartments.length
              }
            </span>{" "}
            departments
          </p>
        </section>

        {/* =====================================================
            DEPARTMENT LIST
        ===================================================== */}

        <section className="mt-6 space-y-4">
          {filteredDepartments.length ===
          0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Building2
                size={42}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-bold text-slate-800">
                No departments found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No departments match the current search or filters.
              </p>
            </div>
          ) : (
            filteredDepartments.map(
              (department) => (
                <div
                  key={
                    department._id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2
                            size={22}
                          />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-slate-900">
                            {
                              department.name
                            }
                          </h2>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {
                              department.code ||
                              "No Code"
                            }
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            department.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {department.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Complaint Categories
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {Array.isArray(
                            department.categories
                          ) &&
                          department.categories
                            .length > 0 ? (
                            department.categories.map(
                              (
                                category
                              ) => (
                                <span
                                  key={
                                    category
                                  }
                                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                  {formatCategory(
                                    category
                                  )}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-sm text-slate-400">
                              No categories assigned
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Users
                            size={16}
                          />

                          {typeof department.officerCount ===
                          "number"
                            ? `${department.officerCount} officers`
                            : "Officer count unavailable"}
                        </span>

                        <span className="break-all text-xs text-slate-400">
                          Department ID:{" "}
                          {
                            department._id
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            department
                          )
                        }
                        title="Edit Department"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil
                          size={17}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          statusUpdatingId ===
                          department._id
                        }
                        onClick={() =>
                          handleToggleStatus(
                            department
                          )
                        }
                        title={
                          department.isActive
                            ? "Deactivate Department"
                            : "Activate Department"
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:opacity-50 ${
                          department.isActive
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {statusUpdatingId ===
                        department._id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : department.isActive ? (
                          <XCircle
                            size={17}
                          />
                        ) : (
                          <CheckCircle2
                            size={17}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(
                            ""
                          );

                          setDeleteTarget(
                            department
                          );
                        }}
                        title="Delete Department"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </section>
      </main>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showDepartmentModal && (
        <ModalOverlay>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <ModalHeader
              title={
                editingDepartment
                  ? "Edit Department"
                  : "Add Department"
              }
              description={
                editingDepartment
                  ? "Update department details and complaint routing categories."
                  : "Create a new department for complaint routing."
              }
              onClose={() =>
                !savingDepartment &&
                setShowDepartmentModal(
                  false
                )
              }
            />

            <form
              onSubmit={
                handleSaveDepartment
              }
              className="space-y-5 p-6"
            >
              {formError && (
                <ErrorBox
                  message={
                    formError
                  }
                />
              )}

              <FormField
                label="Department Name"
                name="name"
                value={
                  departmentForm.name
                }
                onChange={
                  handleFormChange
                }
                placeholder="Example: Water Supply Department"
                disabled={
                  savingDepartment
                }
              />

              <FormField
                label="Department Code"
                name="code"
                value={
                  departmentForm.code
                }
                onChange={
                  handleFormChange
                }
                placeholder="Example: WSD"
                disabled={
                  savingDepartment
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complaint Categories
                </label>

                <textarea
                  name="categories"
                  rows={4}
                  value={
                    departmentForm.categories
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    savingDepartment
                  }
                  placeholder="water_supply, drainage"
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Separate multiple categories using commas.
                  Example: water_supply, drainage
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={
                    savingDepartment
                  }
                  onClick={() =>
                    setShowDepartmentModal(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingDepartment
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingDepartment ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {savingDepartment
                    ? "Saving..."
                    : editingDepartment
                      ? "Update Department"
                      : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <ModalOverlay>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Remove Department?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to remove{" "}
              <span className="font-bold text-slate-800">
                {
                  deleteTarget.name
                }
              </span>
              .
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-700">
                If officers or complaints are currently linked
                to this department, the backend should block
                permanent deletion. Deactivate it instead.
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
                  deleting
                }
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  handleDeleteDepartment
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={17}
                  />
                )}

                {deleting
                  ? "Removing..."
                  : "Remove Department"}
              </button>
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

      <p className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-5 backdrop-blur-sm">
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
    <div className="flex items-start justify-between border-b border-slate-100 p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
  placeholder,
  disabled,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
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

      <p>{message}</p>
    </div>
  );
}

export default AdminDepartmentsPage;