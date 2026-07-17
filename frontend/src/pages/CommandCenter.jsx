import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { vehiclesAPI, alertsAPI, aiAPI } from "../services/api";
import socket from "../services/socket";
import "./CommandCenter.css";

function CommandCenter() {
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alerts");
  const [liveEvents, setLiveEvents] = useState(0);
  const [fleetHealth, setFleetHealth] = useState(0);
  const [fuelEfficiency, setFuelEfficiency] = useState(0);
  const [driverAvailability, setDriverAvailability] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);

  const calculateMetrics = useCallback((vehiclesData, alertsData) => {
    const total = vehiclesData.length;
    const active = vehiclesData.filter(v => v.status === "Active").length;
    const offline = vehiclesData.filter(v => v.status === "Offline").length;
    const inAlert = alertsData.filter(a => !a.acknowledged).length;
    const avgSpd = total > 0 ? Math.round(vehiclesData.reduce((a, v) => a + (v.speed || 0), 0) / total) : 0;
    const totalDist = vehiclesData.reduce((a, v) => a + (v.distance || 0), 0);
    const avgFuel = total > 0 ? Math.round(vehiclesData.reduce((a, v) => a + (v.fuel || 0), 0) / total) : 0;
    const healthScore = total > 0 
      ? Math.round((active / total) * 40 + (1 - inAlert / Math.max(total, 1)) * 30 + (avgFuel / 100) * 30)
      : 0;
    const availDrivers = vehiclesData.filter(v => v.status === "Active" && v.driver !== "Unknown").length;
    const totalDrivers = vehiclesData.filter(v => v.driver !== "Unknown").length;

    setAvgSpeed(avgSpd);
    setTotalDistance(totalDist);
    setFleetHealth(Math.min(100, healthScore));
    setFuelEfficiency(Math.min(100, avgFuel));
    setDriverAvailability(totalDrivers > 0 ? Math.round((availDrivers / totalDrivers) * 100) : 0);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setLiveEvents(prev => Math.floor(Math.random() * 5) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("vehicleUpdate", () => {
      setLiveEvents(prev => prev + 1);
      loadData();
    });
    return () => socket.off("vehicleUpdate");
  }, []);

  const loadData = async () => {
    try {
      const [vRes, aRes, mRes, dRes] = await Promise.allSettled([
        vehiclesAPI.getAll(),
        alertsAPI.getAll({ limit: 100 }),
        aiAPI.getMaintenance(),
        aiAPI.getDriverScores()
      ]);

      let vehiclesData = [];
      let alertsData = [];

      if (vRes.status === "fulfilled") {
        vehiclesData = vRes.value.data || [];
        setVehicles(vehiclesData);
      }
      if (aRes.status === "fulfilled") {
        alertsData = aRes.value.data?.alerts || [];
        setAlerts(alertsData);
      }
      if (mRes.status === "fulfilled") {
        setMaintenance(mRes.value.data || []);
      }
      if (dRes.status === "fulfilled") {
        setDrivers(dRes.value.data || []);
      }

      calculateMetrics(vehiclesData, alertsData);
    } catch (err) {
      console.error("Command center error:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = vehicles.length;
  const active = vehicles.filter(v => v.status === "Active").length;
  const offline = vehicles.filter(v => v.status === "Offline").length;
  const inAlert = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.severity === "Critical" && !a.acknowledged).length;

  const getAlertColor = (severity) => {
    switch (severity) {
      case "Critical": return "#ef4444";
      case "High": return "#f59e0b";
      case "Medium": return "#3b82f6";
      default: return "#22c55e";
    }
  };

  const KPICard = ({ icon, label, value, sub, color, trend }) => (
    <div className="cc-kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="cc-kpi-header">
        <span className="cc-kpi-icon" style={{ background: `${color}15` }}>{icon}</span>
        {trend && <span className={`cc-kpi-trend ${trend > 0 ? "up" : "down"}`}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>}
      </div>
      <div className="cc-kpi-value" style={{ color }}>{value}</div>
      <div className="cc-kpi-label">{label}</div>
      {sub && <div className="cc-kpi-sub">{sub}</div>}
    </div>
  );

  return (
    <Layout>
      <div className="command-center">
        <div className="cc-header">
          <div className="cc-header-left">
            <h1 className="cc-title">🚀 Command Center</h1>
            <p className="cc-subtitle">Enterprise Fleet Operations Control Room</p>
          </div>
          <div className="cc-header-right">
            <div className="cc-live-badge">
              <span className="cc-pulse"></span>
              <span className="cc-live-text">LIVE</span>
              <span className="cc-events">{liveEvents} evt/s</span>
            </div>
            <button className="cc-refresh-btn" onClick={loadData} disabled={loading}>
              {loading ? "⟳" : "↻"} Refresh
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="cc-kpi-grid">
          <KPICard icon="🚛" label="Total Vehicles" value={total} sub="Fleet size" color="#6366f1" trend={2.5} />
          <KPICard icon="🟢" label="Active Vehicles" value={active} sub={`${total > 0 ? Math.round((active / total) * 100) : 0}% of fleet`} color="#22c55e" trend={1.2} />
          <KPICard icon="⭕" label="Offline Vehicles" value={offline} sub="Needs attention" color="#64748b" trend={-0.8} />
          <KPICard icon="🚨" label="Vehicles in Alert" value={inAlert} sub={`${criticalAlerts} critical`} color="#ef4444" trend={criticalAlerts > 0 ? 5 : 0} />
          <KPICard icon="⚡" label="Average Speed" value={`${avgSpeed} km/h`} sub="Fleet average" color="#f59e0b" trend={0.5} />
          <KPICard icon="📏" label="Total Distance" value={`${(totalDistance / 1000).toFixed(1)}k km`} sub="All vehicles" color="#06b6d4" trend={3.1} />
          <KPICard icon="📊" label="Fleet Health Score" value={`${fleetHealth}%`} sub="Overall health" color={fleetHealth > 70 ? "#22c55e" : fleetHealth > 50 ? "#f59e0b" : "#ef4444"} trend={fleetHealth > 70 ? 1.5 : -2} />
          <KPICard icon="⛽" label="Fuel Efficiency" value={`${fuelEfficiency}%`} sub="Avg fuel level" color={fuelEfficiency > 70 ? "#22c55e" : "#f59e0b"} trend={-0.3} />
          <KPICard icon="👤" label="Driver Availability" value={`${driverAvailability}%`} sub="Active drivers" color={driverAvailability > 70 ? "#22c55e" : "#f59e0b"} trend={0.8} />
        </div>

        {/* Tabs */}
        <div className="cc-tabs">
          <button className={`cc-tab ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}>
            🚨 Active Alerts {inAlert > 0 && <span className="cc-tab-badge">{inAlert}</span>}
          </button>
          <button className={`cc-tab ${activeTab === "vehicles" ? "active" : ""}`} onClick={() => setActiveTab("vehicles")}>
            🚛 Vehicle Status
          </button>
          <button className={`cc-tab ${activeTab === "drivers" ? "active" : ""}`} onClick={() => setActiveTab("drivers")}>
            👤 Driver Overview
          </button>
          <button className={`cc-tab ${activeTab === "maintenance" ? "active" : ""}`} onClick={() => setActiveTab("maintenance")}>
            🔧 Maintenance Queue
          </button>
        </div>

        {/* Panel Content */}
        <div className="cc-panel">
          {loading ? (
            <div className="cc-loading">
              <div className="loading-spinner"></div>
              <span>Loading command center data...</span>
            </div>
          ) : activeTab === "alerts" ? (
            <div className="cc-alerts-list">
              {alerts.length === 0 ? (
                <div className="cc-empty">
                  <div className="cc-empty-icon">✅</div>
                  <h3>All Clear</h3>
                  <p>No active alerts. Fleet operating normally.</p>
                </div>
              ) : (
                alerts.slice(0, 20).map((alert, i) => (
                  <div key={alert._id || i} className="cc-alert-item" style={{ borderLeftColor: getAlertColor(alert.severity) }}>
                    <div className="cc-alert-severity" style={{ background: getAlertColor(alert.severity) }}>
                      {alert.severity === "Critical" ? "CRIT" : alert.severity === "High" ? "HIGH" : "MED"}
                    </div>
                    <div className="cc-alert-content">
                      <div className="cc-alert-vehicle">{alert.vehicleId}</div>
                      <div className="cc-alert-message">{alert.message || `${alert.type} alert triggered`}</div>
                    </div>
                    <div className="cc-alert-time">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : "Just now"}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "vehicles" ? (
            <div className="cc-vehicles-grid">
              {vehicles.length === 0 ? (
                <div className="cc-empty">
                  <div className="cc-empty-icon">🚛</div>
                  <h3>No Vehicles</h3>
                  <p>No vehicles registered in the system.</p>
                </div>
              ) : (
                vehicles.map((v, i) => (
                  <div key={v._id || i} className={`cc-vehicle-card ${v.status === "Active" ? "active" : "offline"}`}>
                    <div className="cc-v-header">
                      <span className="cc-v-id">{v.vehicleId}</span>
                      <span className={`cc-v-status ${v.status === "Active" ? "online" : "offline"}`}>
                        {v.status === "Active" ? "● Active" : "○ Offline"}
                      </span>
                    </div>
                    <div className="cc-v-detail">👤 {v.driver || "Unknown"}</div>
                    <div className="cc-v-detail">⚡ {v.speed || 0} km/h</div>
                    <div className="cc-v-detail">⛽ {Math.round(v.fuel || 0)}%</div>
                    <div className="cc-v-detail">📏 {(v.distance || 0).toLocaleString()} km</div>
                    <div className="cc-v-progress">
                      <div className="cc-v-progress-bar" style={{ width: `${v.fuel || 0}%`, background: (v.fuel || 0) > 50 ? "#22c55e" : (v.fuel || 0) > 25 ? "#f59e0b" : "#ef4444" }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "drivers" ? (
            <div className="cc-drivers-list">
              {drivers.length === 0 ? (
                <div className="cc-empty">
                  <div className="cc-empty-icon">👤</div>
                  <h3>No Driver Data</h3>
                  <p>Driver performance data not available.</p>
                </div>
              ) : (
                drivers.map((d, i) => (
                  <div key={i} className={`cc-driver-card ${d.rating === "Risky" ? "risky" : d.rating === "Average" ? "average" : "good"}`}>
                    <div className="cc-d-header">
                      <span>👤 {d.driver}</span>
                      <span className="cc-d-rating" style={{ color: d.rating === "Risky" ? "#ef4444" : d.rating === "Average" ? "#f59e0b" : "#22c55e" }}>
                        {d.rating}
                      </span>
                    </div>
                    <div className="cc-d-detail">Vehicle: {d.vehicleId}</div>
                    <div className="cc-d-detail">Score: {d.safetyScore || d.overallScore || "N/A"}</div>
                    <div className="cc-d-detail">Violations: {d.speedViolations || 0} | Brakes: {d.hardBraking || 0}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="cc-maintenance-list">
              {maintenance.length === 0 ? (
                <div className="cc-empty">
                  <div className="cc-empty-icon">🔧</div>
                  <h3>No Maintenance</h3>
                  <p>No pending maintenance tasks.</p>
                </div>
              ) : (
                maintenance.filter(p => p.severity === "Critical" || p.severity === "High").map((m, i) => (
                  <div key={i} className="cc-maint-card" style={{ borderLeftColor: m.severity === "Critical" ? "#ef4444" : "#f97316" }}>
                    <div className="cc-m-header">
                      <span>{m.vehicleId}</span>
                      <span className={`cc-m-severity ${m.severity?.toLowerCase()}`}>{m.severity}</span>
                    </div>
                    <div className="cc-m-detail">Component: {m.component}</div>
                    <div className="cc-m-detail">Probability: {m.probability}% | Due: {m.predictedDays}d</div>
                    <div className="cc-m-detail">Est. Cost: ₹{m.estimatedCost?.toLocaleString() || "N/A"}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CommandCenter;