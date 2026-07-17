import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../services/api";
import socket from "../../services/socket";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll({ limit: 10 });
      const data = res.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread || 0);
    } catch (err) {
      // Fall back to local if API fails
      console.warn("Using local notifications:", err.message);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch {
      // Silent fallback
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Listen for real-time notifications
    socket.on("notification", () => {
      fetchUnreadCount();
      fetchNotifications();
    });

    socket.on("vehicleUpdate", () => {
      fetchUnreadCount();
    });

    // Close panel on outside click
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("notification");
      socket.off("vehicleUpdate");
    };
  }, [fetchNotifications, fetchUnreadCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert": return "🚨";
      case "maintenance": return "🔧";
      case "info": return "ℹ️";
      case "system": return "⚙️";
      case "driver": return "👤";
      case "fuel": return "⛽";
      default: return "🔔";
    }
  };

  const getNotificationColor = (severity) => {
    switch (severity) {
      case "critical": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "#ef4444" };
      case "warning": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "#f59e0b" };
      case "success": return { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "#22c55e" };
      default: return { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "#3b82f6" };
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search vehicles, drivers, trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut">⌘K</span>
        </form>
      </div>

      <div className="navbar-right">
        <div className="navbar-status">
          <span className="status-indicator"></span>
          All Systems Operational
        </div>
        <div className="navbar-notification" onClick={() => setShowNotifications(!showNotifications)} ref={notificationRef}>
          <span>🔔</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <button onClick={markAllRead} style={{
                  background: "none", border: "none", color: "#6366f1",
                  fontSize: 12, cursor: "pointer", fontWeight: 500
                }}>
                  Mark all read
                </button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const colors = getNotificationColor(notif.severity);
                    return (
                      <div
                        key={notif._id}
                        className={`notification-item ${!notif.read ? "unread" : ""}`}
                        onClick={() => markAsRead(notif._id)}
                        style={{
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                          borderLeft: `3px solid ${!notif.read ? colors.border : "transparent"}`,
                          background: !notif.read ? "rgba(255,255,255,0.02)" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: colors.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, flexShrink: 0
                        }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, color: "#e2e8f0",
                            fontWeight: !notif.read ? 600 : 400,
                            lineHeight: 1.4
                          }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : "Just now"}
                          </div>
                        </div>
                        {!notif.read && (
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#6366f1", flexShrink: 0, marginTop: 4
                          }}></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="notification-panel-footer">
                <button onClick={() => { setShowNotifications(false); navigate("/alerts"); }} style={{
                  background: "none", border: "none", color: "#6366f1",
                  fontSize: 12, cursor: "pointer", fontWeight: 500, width: "100%", padding: 10
                }}>
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-avatar">👤</span>
          <div>
            <div className="user-name">{user.name || "Admin"}</div>
            <div className="user-role">{user.role || "Fleet Manager"}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;