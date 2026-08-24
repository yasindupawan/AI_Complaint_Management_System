import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Bell,
  FilePlus2,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Globe2,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getCurrentUser } from "../api/authApi";
import { getMyComplaints } from "../api/complaintApi";
import { getUnreadNotificationCount } from "../api/notificationApi";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    brandSub: "Citizen Portal",

    notifications: "Notifications",
    logout: "Logout",

    dashboard: "Citizen Dashboard",
    welcome: "Welcome back",
    welcomeDescription:
      "Submit new public complaints, monitor their progress and stay informed about important updates.",

    newComplaint: "New Complaint",

    totalComplaints: "Total Complaints",
    submitted: "Submitted",
    assigned: "Assigned",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    duplicate: "Duplicate",

    submitNewComplaint: "Submit New Complaint",
    submitDescription:
      "Report a public issue with details, location and supporting images.",

    myComplaints: "My Complaints",
    myComplaintsDescription:
      "View all submitted complaints and track their current status.",

    notificationTitle: "Notifications",
    notificationDescription:
      "Check important updates about complaint assignment, progress and resolution.",

    recentComplaints: "Recent Complaints",
    recentDescription:
      "Your most recently submitted public complaints.",

    viewAll: "View All",

    complaint: "Complaint",
    category: "Category",
    priority: "Priority",
    status: "Status",
    date: "Date",

    high: "High",
    medium: "Medium",
    low: "Low",

    roads: "Roads",
    waterSupply: "Water Supply",
    environment: "Environment",
    electricity: "Electricity",
    garbage: "Garbage",
    drainage: "Drainage",

    loading: "Loading your dashboard...",
    loadError: "Unable to load dashboard information.",
    noComplaints: "No complaints submitted yet.",
    noComplaintsDescription:
      "Your recently submitted complaints will appear here.",
  },

  "සිං": {
    brand: "මහජන පැමිණිලි",
    brandSub: "පුරවැසි ද්වාරය",

    notifications: "දැනුම්දීම්",
    logout: "ඉවත් වන්න",

    dashboard: "පුරවැසි උපකරණ පුවරුව",
    welcome: "නැවත සාදරයෙන් පිළිගනිමු",
    welcomeDescription:
      "නව මහජන පැමිණිලි ඉදිරිපත් කරන්න, ඒවායේ ප්‍රගතිය නිරීක්ෂණය කරන්න සහ වැදගත් යාවත්කාලීන තොරතුරු ලබා ගන්න.",

    newComplaint: "නව පැමිණිල්ලක්",

    totalComplaints: "මුළු පැමිණිලි",
    submitted: "ඉදිරිපත් කර ඇත",
    assigned: "පවරා ඇත",
    inProgress: "ක්‍රියාත්මක වෙමින්",
    resolved: "විසඳා ඇත",
    rejected: "ප්‍රතික්ෂේප කර ඇත",
    duplicate: "අනුපිටපතක්",

    submitNewComplaint: "නව පැමිණිල්ලක් ඉදිරිපත් කරන්න",
    submitDescription:
      "ගැටලුවේ විස්තර, ස්ථානය සහ අදාළ ඡායාරූප සමඟ මහජන ගැටලුවක් වාර්තා කරන්න.",

    myComplaints: "මගේ පැමිණිලි",
    myComplaintsDescription:
      "ඔබ ඉදිරිපත් කළ සියලුම පැමිණිලි බලන්න සහ ඒවායේ වත්මන් තත්ත්වය නිරීක්ෂණය කරන්න.",

    notificationTitle: "දැනුම්දීම්",
    notificationDescription:
      "පැමිණිලි පැවරීම, ප්‍රගතිය සහ විසඳීම පිළිබඳ වැදගත් යාවත්කාලීන තොරතුරු බලන්න.",

    recentComplaints: "මෑත පැමිණිලි",
    recentDescription:
      "ඔබ මෑතකදී ඉදිරිපත් කළ මහජන පැමිණිලි.",

    viewAll: "සියල්ල බලන්න",

    complaint: "පැමිණිල්ල",
    category: "වර්ගය",
    priority: "ප්‍රමුඛතාව",
    status: "තත්ත්වය",
    date: "දිනය",

    high: "ඉහළ",
    medium: "මධ්‍යම",
    low: "අඩු",

    roads: "මාර්ග",
    waterSupply: "ජල සැපයුම",
    environment: "පරිසරය",
    electricity: "විදුලිය",
    garbage: "කසළ",
    drainage: "ජලාපවහනය",

    loading: "ඔබගේ උපකරණ පුවරුව පූරණය වෙමින් පවතී...",
    loadError: "උපකරණ පුවරුවේ තොරතුරු ලබාගත නොහැක.",
    noComplaints: "තවම පැමිණිලි ඉදිරිපත් කර නොමැත.",
    noComplaintsDescription:
      "ඔබ ඉදිරිපත් කරන පැමිණිලි මෙහි දිස්වනු ඇත.",
  },

  "தமிழ்": {
    brand: "பொது புகார்கள்",
    brandSub: "குடிமக்கள் தளம்",

    notifications: "அறிவிப்புகள்",
    logout: "வெளியேறு",

    dashboard: "குடிமக்கள் முகப்புப்பலகை",
    welcome: "மீண்டும் வரவேற்கிறோம்",
    welcomeDescription:
      "புதிய பொது புகார்களை சமர்ப்பிக்கவும், அவற்றின் முன்னேற்றத்தைக் கண்காணிக்கவும் மற்றும் முக்கிய புதுப்பிப்புகளைப் பெறவும்.",

    newComplaint: "புதிய புகார்",

    totalComplaints: "மொத்த புகார்கள்",
    submitted: "சமர்ப்பிக்கப்பட்டது",
    assigned: "ஒதுக்கப்பட்டது",
    inProgress: "செயல்பாட்டில்",
    resolved: "தீர்க்கப்பட்டது",
    rejected: "நிராகரிக்கப்பட்டது",
    duplicate: "நகல் புகார்",

    submitNewComplaint: "புதிய புகாரை சமர்ப்பிக்கவும்",
    submitDescription:
      "பிரச்சினையின் விவரங்கள், இருப்பிடம் மற்றும் ஆதாரப் படங்களுடன் பொது பிரச்சினையைப் புகாரளிக்கவும்.",

    myComplaints: "எனது புகார்கள்",
    myComplaintsDescription:
      "சமர்ப்பிக்கப்பட்ட அனைத்து புகார்களையும் பார்த்து அவற்றின் தற்போதைய நிலையை கண்காணிக்கவும்.",

    notificationTitle: "அறிவிப்புகள்",
    notificationDescription:
      "புகார் ஒதுக்கீடு, முன்னேற்றம் மற்றும் தீர்வு தொடர்பான முக்கிய புதுப்பிப்புகளைப் பார்க்கவும்.",

    recentComplaints: "சமீபத்திய புகார்கள்",
    recentDescription:
      "நீங்கள் சமீபத்தில் சமர்ப்பித்த பொது புகார்கள்.",

    viewAll: "அனைத்தையும் பார்க்க",

    complaint: "புகார்",
    category: "வகை",
    priority: "முன்னுரிமை",
    status: "நிலை",
    date: "தேதி",

    high: "உயர்",
    medium: "நடுத்தர",
    low: "குறைந்த",

    roads: "சாலைகள்",
    waterSupply: "நீர் வழங்கல்",
    environment: "சுற்றுச்சூழல்",
    electricity: "மின்சாரம்",
    garbage: "கழிவு",
    drainage: "வடிகால்",

    loading: "உங்கள் முகப்புப்பலகை ஏற்றப்படுகிறது...",
    loadError: "முகப்புப்பலகை தகவலை ஏற்ற முடியவில்லை.",
    noComplaints: "இதுவரை புகார்கள் சமர்ப்பிக்கப்படவில்லை.",
    noComplaintsDescription:
      "நீங்கள் சமர்ப்பிக்கும் புகார்கள் இங்கே தோன்றும்.",
  },
};

/* =========================================================
   CITIZEN DASHBOARD
========================================================= */

function CitizenDashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");

  const [user, setUser] = useState({
    fullName: "",
    email: "",
  });

  const [complaints, setComplaints] = useState([]);

  // Real unread notification count
  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = translations[language];

  /* =========================================================
     LOAD REAL USER + COMPLAINTS + NOTIFICATION COUNT
  ========================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
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

        const [
          userResponse,
          complaintsResponse,
          notificationCountResponse,
        ] = await Promise.all([
          getCurrentUser(token),
          getMyComplaints(token),
          getUnreadNotificationCount(token),
        ]);

        /* USER */

        if (userResponse?.user) {
          setUser(userResponse.user);
        }

        /* COMPLAINTS */

        setComplaints(
          Array.isArray(complaintsResponse?.complaints)
            ? complaintsResponse.complaints
            : []
        );

        /* UNREAD NOTIFICATIONS */

        setUnreadNotificationCount(
          Number(notificationCountResponse?.unreadCount) || 0
        );
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(err?.message || t.loadError);

        const errorMessage =
          err?.message?.toLowerCase() || "";

        if (
          errorMessage.includes("token") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("not authorized")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  /* =========================================================
     REAL STATISTICS
  ========================================================= */

  const stats = {
    total: complaints.length,

    submitted: complaints.filter(
      (complaint) =>
        complaint.status === "submitted"
    ).length,

    inProgress: complaints.filter(
      (complaint) =>
        complaint.status === "in_progress"
    ).length,

    resolved: complaints.filter(
      (complaint) =>
        complaint.status === "resolved"
    ).length,
  };

  /* Backend already returns newest complaints first */

  const recentComplaints = complaints.slice(0, 5);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusLabel = (status) => {
    switch (status) {
      case "submitted":
        return t.submitted;

      case "assigned":
        return t.assigned;

      case "in_progress":
        return t.inProgress;

      case "resolved":
        return t.resolved;

      case "rejected":
        return t.rejected;

      case "duplicate":
        return t.duplicate;

      default:
        return status || "-";
    }
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

  /* =========================================================
     PRIORITY
  ========================================================= */

  const getPriorityLabel = (priority) => {
    const normalized =
      priority?.toLowerCase() || "";

    switch (normalized) {
      case "high":
        return t.high;

      case "medium":
        return t.medium;

      case "low":
        return t.low;

      default:
        return priority || "-";
    }
  };

  const getPriorityStyle = (priority) => {
    const normalized =
      priority?.toLowerCase() || "";

    switch (normalized) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-amber-50 text-amber-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  /* =========================================================
     CATEGORY
  ========================================================= */

  const getCategoryLabel = (category) => {
    if (!category) {
      return "-";
    }

    const normalized = category
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    switch (normalized) {
      case "roads":
      case "road":
        return t.roads;

      case "water_supply":
      case "water":
        return t.waterSupply;

      case "environment":
        return t.environment;

      case "electricity":
        return t.electricity;

      case "garbage":
        return t.garbage;

      case "drainage":
        return t.drainage;

      default:
        return category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          );
    }
  };

  /* =========================================================
     DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    const locale =
      language === "සිං"
        ? "si-LK"
        : language === "தமிழ்"
          ? "ta-LK"
          : "en-GB";

    return parsedDate.toLocaleDateString(
      locale,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     SHORT COMPLAINT ID
  ========================================================= */

  const getComplaintId = (complaint) => {
    const id = complaint?._id || complaint?.id;

    if (!id) {
      return "-";
    }

    return `CMP-${id
      .toString()
      .slice(-6)
      .toUpperCase()}`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* BRAND */}

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BrainCircuit size={23} />
            </div>

            <div className="leading-tight">
              <p className="font-bold text-slate-900">
                {t.brand}
              </p>

              <p className="text-xs font-medium text-blue-600">
                {t.brandSub}
              </p>
            </div>
          </Link>

          {/* DESKTOP */}

          <div className="hidden items-center gap-3 md:flex">

            {/* LANGUAGE */}

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <Globe2
                size={16}
                className="ml-2 text-slate-500"
              />

              {["EN", "සිං", "தமிழ்"].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setLanguage(item)
                    }
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                      language === item
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            {/* NOTIFICATIONS */}

            <Link
              to="/notifications"
              title={t.notifications}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
            >
              <Bell size={20} />

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </Link>

            {/* USER */}

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <User size={20} />
              </div>

              <div className="hidden lg:block">
                <p className="max-w-40 truncate text-sm font-bold">
                  {user.fullName || "..."}
                </p>

                <p className="max-w-40 truncate text-xs text-slate-500">
                  {user.email || "..."}
                </p>
              </div>
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={logout}
              title={t.logout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={19} />
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white p-5 md:hidden">
            <div className="flex flex-col gap-3">

              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold">
                  {user.fullName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              {/* MOBILE NOTIFICATIONS */}

              <Link
                to="/notifications"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold"
              >
                <span>{t.notifications}</span>

                {unreadNotificationCount > 0 && (
                  <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </Link>

              <div className="flex gap-2">
                {["EN", "සිං", "தமிழ்"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setLanguage(item)
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                        language === item
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600"
              >
                {t.logout}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* WELCOME */}

        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {t.dashboard}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.welcome}
              {user.fullName
                ? `, ${user.fullName}`
                : ""}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {t.welcomeDescription}
            </p>
          </div>

          <Link
            to="/complaints/new"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <FilePlus2 size={19} />

            {t.newComplaint}
          </Link>
        </section>

        {/* STATISTICS */}

        <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<FileText size={22} />}
            title={t.totalComplaints}
            value={stats.total}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={<AlertCircle size={22} />}
            title={t.submitted}
            value={stats.submitted}
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={<Clock3 size={22} />}
            title={t.inProgress}
            value={stats.inProgress}
            iconStyle="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={<CheckCircle2 size={22} />}
            title={t.resolved}
            value={stats.resolved}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">

          {/* NEW COMPLAINT */}

          <Link
            to="/complaints/new"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FilePlus2 size={23} />
              </div>

              <ChevronRight
                size={20}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="mt-5 font-bold">
              {t.submitNewComplaint}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t.submitDescription}
            </p>
          </Link>

          {/* MY COMPLAINTS */}

          <Link
            to="/complaints"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={23} />
              </div>

              <ChevronRight
                size={20}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="mt-5 font-bold">
              {t.myComplaints}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t.myComplaintsDescription}
            </p>
          </Link>

          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Bell size={23} />

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </div>

              <ChevronRight
                size={20}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="mt-5 flex items-center gap-2 font-bold">
              {t.notificationTitle}

              {unreadNotificationCount > 0 && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                  {unreadNotificationCount}
                </span>
              )}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t.notificationDescription}
            </p>
          </Link>
        </section>

        {/* =====================================================
            RECENT COMPLAINTS
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold">
                {t.recentComplaints}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t.recentDescription}
              </p>
            </div>

            <Link
              to="/complaints"
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              {t.viewAll}
            </Link>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="px-6 py-12 text-center text-sm font-medium text-slate-500">
              {t.loading}
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            recentComplaints.length === 0 && (
              <div className="px-6 py-12 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={23} />
                </div>

                <p className="mt-4 font-bold text-slate-800">
                  {t.noComplaints}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {t.noComplaintsDescription}
                </p>
              </div>
            )}

          {/* DESKTOP TABLE */}

          {!loading &&
            recentComplaints.length > 0 && (
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">

                      <th className="px-6 py-4 font-semibold">
                        {t.complaint}
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        {t.category}
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        {t.priority}
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        {t.status}
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        {t.date}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentComplaints.map(
                      (complaint) => {
                        const complaintId =
                          complaint._id ||
                          complaint.id;

                        return (
                          <tr
                            key={complaintId}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">

                              <Link
                                to={`/complaints/${complaintId}`}
                                className="font-semibold text-slate-800 hover:text-blue-600"
                              >
                                {complaint.title}
                              </Link>

                              <p className="mt-1 text-xs text-slate-400">
                                {getComplaintId(
                                  complaint
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {getCategoryLabel(
                                complaint.category
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                                  complaint.priority
                                )}`}
                              >
                                {getPriorityLabel(
                                  complaint.priority
                                )}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                  complaint.status
                                )}`}
                              >
                                {getStatusLabel(
                                  complaint.status
                                )}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-500">
                              {formatDate(
                                complaint.createdAt
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}

          {/* MOBILE */}

          {!loading &&
            recentComplaints.length > 0 && (
              <div className="divide-y divide-slate-100 md:hidden">

                {recentComplaints.map(
                  (complaint) => {
                    const complaintId =
                      complaint._id ||
                      complaint.id;

                    return (
                      <Link
                        key={complaintId}
                        to={`/complaints/${complaintId}`}
                        className="block p-5 transition hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="font-bold">
                              {complaint.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {getComplaintId(
                                complaint
                              )}
                            </p>
                          </div>

                          <ChevronRight
                            size={18}
                            className="text-slate-400"
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >
                            {getStatusLabel(
                              complaint.status
                            )}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                              complaint.priority
                            )}`}
                          >
                            {getPriorityLabel(
                              complaint.priority
                            )}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          {getCategoryLabel(
                            complaint.category
                          )}{" "}
                          ·{" "}
                          {formatDate(
                            complaint.createdAt
                          )}
                        </p>
                      </Link>
                    );
                  }
                )}
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
  icon,
  title,
  value,
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

export default CitizenDashboard;