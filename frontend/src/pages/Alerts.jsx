import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { alertsAPI } from "../services/api";
import socket from "../services/socket";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unacknowledged: 0, bySeverity: [], byType: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50 };
      if (filter !== "All") params.type = filter;
      if (severityFilter !== "All") params.severity = severityFilter;

      const [alertsRes, statsRes] = await Promise.allSettled([
        alertsAPI.getAll(params),
        alertsAPI.getStats()
      ]);

      if (alertsRes.status === "fulfilled") {
        const data = alertsRes.value.data;
        setAlerts(data.alerts || []);
        setTotalPages(data.pages || 1);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filter, severityFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    socket.on("vehicleUpdate", (data) => {
      if (data && data.type && data.type !== "analytics_tick") {
        const alert = {
          _id: `live_${Date.now()}`,
          type: data.type,
          message: data.message || `${data.type} alert`,
          severity: data.severity || "Medium",
          vehicleId: data.vehicleId,
          createdAt: new Date(data.timestamp || Date.now()),
          acknowledged: false
        };
        setLiveAlerts(prev => [alert, ...prev].slice(0, 20));
      }
    });
    return () => socket.off("vehicleUpdate");
  }, []);

  const allAlerts = [...liveAlerts, ...alerts].filter(
    (alert, index, self) => index === self.findIndex(a => a._id === alert._id)
  );

  const filtered = allAlerts.filter(a => {
    const matchesFilter = filter === "All" || a.type === filter;
    const matchesSeverity = severityFilter === "All" || a.severity === severityFilter;
    return matchesFilter && matchesSeverity;
  });

  const acknowledge = async (id) => {
    try {
      if (id.startsWith("live_")) {
        setLiveAlerts(liveAlerts.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      } else {
        await alertsAPI.acknowledge(id);
        setAlerts(alerts.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      }
    } catch (err) {
      console.error("Acknowledge error:", err);
    }
  };

  const acknowledgeAll = async () => {
    try {
      await alertsAPI.acknowledgeAll();
      setAlerts(alerts.map(a => ({ ...a, acknowledged: true })));
      setLiveAlerts(liveAlerts.map(a => ({ ...a, acknowledged: true })));
    } catch (err) {
      console.error("Acknowledge all error:", err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "rgba(239,68,68,0.2)" };
      case "High": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" };
      case "Medium": return { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.2)" };
      default: return { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "rgba(34,197,94,0.2)" };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Overspeed": return "🚀";
      case "Vehicle Offline": return "📡";
      case "Low Fuel": return "⛽";
      case "Geofence": return "📍";
      case "Engine Warning": return "🔧";
      case "Fuel Theft": return "💰";
      case "Maintenance Due": return "🔧";
      case "Battery Low": return "🔋";
      case "Critical Temperature": return "🌡️";
      case "Tire Pressure": return "⚙️";
      case "Accident": return "💥";
      default: return "⚠️";
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🔔 Alert Center</h1>
          <p>Real-time fleet alerts and notifications - {stats.unacknowledged || 0} unacknowledged</p>
        </div>
        <div className="page-header-right">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
            <option value="All">All Types</option>
            <option value="Overspeed">Overspeed</option>
            <option value="Vehicle Offline">Offline</option>
            <option value="Low Fuel">Low Fuel</option>
            <option value="Geofence">Geofence</option>
            <option value="Engine Warning">Engine Warning</option>
            <option value="Fuel Theft">Fuel Theft</option>
            <option value="Maintenance Due">Maintenance</option>
            <option value="Battery Low">Battery Low</option>
            <option value="Critical Temperature">Temperature</option>
          </select>
          <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="btn btn-secondary" onClick={acknowledgeAll}>✅ Acknowledge All</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{stats.total || allAlerts.length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Critical</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {stats.bySeverity?.find(s => s._id === "Critical")?.count || allAlerts.filter(a => a.severity === "Critical").length}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Unacknowledged</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{stats.unacknowledged || allAlerts.filter(a => !a.acknowledged).length}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Overspeed</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>
            {stats.byType?.find(t => t._id === "Overspeed")?.count || allAlerts.filter(a => a.type === "Overspeed").length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading alerts...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No Alerts</h3>
          <p>No alerts match your current filters. Fleet operating normally.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.slice(0, 100).map((alert) => {
              const colors = getSeverityColor(alert.severity);
              return (
                <div key={alert._id} className="card" style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft: `3px solid ${alert.acknowledged ? "transparent" : colors.text}`,
                  opacity: alert.acknowledged ? 0.6 : 1
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: colors.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                  }}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{alert.message}</span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontWeight: 600 }}>
                        {alert.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {alert.type} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "Just now"} • {alert.vehicleId}
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button className="btn btn-secondary btn-sm" onClick={() => acknowledge(alert._id)}>✅ Acknowledge</button>
                  )}
                  {alert.acknowledged && <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>✓ Acknowledged</span>}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span style={{ color: "#64748b", fontSize: 13, display: "flex", alignItems: "center" }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default Alerts;