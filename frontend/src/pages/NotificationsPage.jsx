import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock3,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notificationService";

function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const data = await getMyNotifications(token);

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Load notifications error:", err);

      setError(
        err?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================================================
  // MARK ONE AS READ + OPEN COMPLAINT
  // =========================================================

  const handleNotificationClick = async (notification) => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      // Mark notification as read only if currently unread
      if (!notification.isRead) {
        await markNotificationAsRead(
          notification._id,
          token
        );

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : item
          )
        );
      }

      // Open related complaint
      if (notification.complaint?._id) {
        navigate(
          `/complaints/${notification.complaint._id}`
        );
      }
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      setError(
        err?.message ||
          "Unable to open notification."
      );
    }
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      await markAllNotificationsAsRead(token);

      const now = new Date().toISOString();

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || now,
        }))
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );

      setError(
        err?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const totalNotifications = notifications.length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const readNotifications =
    totalNotifications - unreadNotifications;

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">

        {/* BACK */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* PAGE HEADER */}

        <section className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold text-blue-600">
              Citizen Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Stay informed about complaint assignments,
              status updates, duplicate reviews and final
              resolutions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={
              unreadNotifications === 0 ||
              markingAll
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {markingAll ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <CheckCheck size={18} />
            )}

            {markingAll
              ? "Updating..."
              : "Mark All as Read"}
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={<Bell size={20} />}
            title="Total Notifications"
            value={totalNotifications}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={<AlertCircle size={20} />}
            title="Unread"
            value={unreadNotifications}
            iconStyle="bg-red-50 text-red-600"
          />

          <SummaryCard
            icon={<CheckCheck size={20} />}
            title="Read"
            value={readNotifications}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

        </section>

        {/* NOTIFICATION LIST */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-bold">
              Recent Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Updates related to your submitted complaints.
            </p>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-slate-500">
              <Loader2
                size={24}
                className="animate-spin text-blue-600"
              />

              <span className="text-sm font-semibold">
                Loading notifications...
              </span>
            </div>
          ) : notifications.length === 0 ? (

            /* EMPTY */

            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bell size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No notifications yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Notifications will appear here when there are
                updates about your complaints.
              </p>

              <Link
                to="/complaints"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <FileText size={18} />
                View My Complaints
              </Link>

            </div>
          ) : (

            /* LIST */

            <div className="divide-y divide-slate-100">

              {notifications.map((notification) => (

                <div
                  key={notification._id}
                  className={`p-6 transition ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-blue-50/50"
                  }`}
                >

                  <div className="flex gap-4">

                    {/* ICON */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notification.isRead
                          ? "bg-slate-100 text-slate-500"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <Bell size={20} />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <p className="font-bold">
                              {notification.title ||
                                "Notification"}
                            </p>

                            {!notification.isRead && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                New
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {notification.message}
                          </p>

                        </div>

                        {!notification.isRead && (
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                        )}

                      </div>

                      {/* COMPLAINT LINK */}

                      {notification.complaint && (
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                        >
                          <FileText size={15} />

                          {notification.complaint.title ||
                            "View Complaint"}
                        </button>
                      )}

                      {/* DATE */}

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">

                        <Clock3 size={14} />

                        {formatDate(
                          notification.createdAt
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  title,
  value,
  iconStyle,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <p className="text-2xl font-extrabold">
          {value}
        </p>

      </div>

      <p className="mt-4 text-sm font-semibold text-slate-600">
        {title}
      </p>

    </div>
  );
}

export default NotificationsPage;