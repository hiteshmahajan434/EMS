import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Bell, Check, LoaderCircle } from "lucide-react";
import { io } from "socket.io-client";
import api, { SERVER_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const connectionLabels = {
    connecting: "Connecting to live updates...",
    connected: "Live updates connected",
    reconnecting: "Reconnecting to live updates...",
    disconnected: "Live updates disconnected"
};

const NotificationBell = () => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [connectionError, setConnectionError] = useState("");
    const dropdownRef = useRef(null);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/notifications");
            setNotifications(data.data);
            setUnreadCount(data.unreadCount);
        } catch (loadError) {
            setError(loadError.response?.data?.error || "Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!token || !user || !["admin", "manager", "employee"].includes(user.role)) {
            setConnectionStatus("disconnected");
            return undefined;
        }

        void loadNotifications();

        const socket = io(SERVER_URL, { auth: { token } });
        socket.on("connect", () => {
            setConnectionStatus("connected");
            setConnectionError("");
            void loadNotifications();
        });
        socket.on("disconnect", () => {
            setConnectionStatus(socket.active ? "reconnecting" : "disconnected");
        });
        socket.on("connect_error", (connectError) => {
            setConnectionStatus("reconnecting");
            setConnectionError(connectError.message || "Connection failed.");
        });
        socket.on("notification:new", (notification) => {
            setNotifications((current) => [
                notification,
                ...current.filter((item) => item._id !== notification._id)
            ].slice(0, 50));
            if (!notification.isRead) {
                setUnreadCount((count) => count + 1);
            }
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [loadNotifications, token, user]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const closeOnOutsideClick = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isOpen]);

    const handleOpen = () => {
        const opening = !isOpen;
        setIsOpen(opening);
        if (opening) void loadNotifications();
    };

    const markAsRead = async (notification) => {
        if (notification.isRead) return;

        try {
            const { data } = await api.patch(`/notifications/${notification._id}/read`);
            setNotifications((current) =>
                current.map((item) => item._id === notification._id ? data.data : item)
            );
            setUnreadCount((count) => Math.max(0, count - 1));
        } catch (readError) {
            setError(readError.response?.data?.error || "Unable to mark notification as read.");
        }
    };

    if (!user || !["admin", "manager", "employee"].includes(user.role)) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleOpen}
                className="relative inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <section
                    className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                    role="dialog"
                    aria-label="Notifications"
                >
                    <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <h2 className="font-semibold text-slate-900">Notifications</h2>
                            <p className="text-xs text-slate-500">
                                {unreadCount} unread
                            </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                            connectionStatus === "connected"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                        }`}>
                            {connectionLabels[connectionStatus]}
                        </span>
                    </header>

                    {connectionError && (
                        <p className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                            {connectionError}
                        </p>
                    )}

                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading notifications...
                            </div>
                        ) : error && notifications.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-rose-600">{error}</p>
                        ) : notifications.length === 0 ? (
                            <p className="px-4 py-10 text-center text-sm text-slate-500">
                                You’re all caught up. No notifications yet.
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification._id}
                                    onClick={() => void markAsRead(notification)}
                                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 ${
                                        notification.isRead ? "bg-white" : "bg-indigo-50/50"
                                    }`}
                                >
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                        notification.isRead ? "bg-slate-300" : "bg-indigo-500"
                                    }`} />
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-sm ${
                                            notification.isRead ? "text-slate-600" : "font-medium text-slate-900"
                                        }`}>
                                            {notification.message}
                                        </span>
                                        <span className="mt-1 block text-xs text-slate-500">
                                            {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                            {notification.isRead && <Check className="h-3 w-3" />}
                                            {notification.isRead ? "Read" : "Unread"}
                                        </span>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    {error && notifications.length > 0 && (
                        <p className="border-t border-rose-100 px-4 py-2 text-xs text-rose-600">{error}</p>
                    )}
                </section>
            )}
        </div>
    );
};

export default NotificationBell;
