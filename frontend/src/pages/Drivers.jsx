import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { driversAPI } from "../services/api";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    experience: "",
    currentStatus: "Available"
  });

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: searchQuery || undefined, status: statusFilter };
      const res = await driversAPI.getAll(params);
      setDrivers(res.data.drivers || []);
      setError(null);
    } catch (err) {
      // Fallback to empty array if API fails
      setDrivers([]);
      if (!drivers.length) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        safetyScore: editingDriver?.safetyScore || Math.floor(Math.random() * 30) + 70
      };

      if (editingDriver) {
        const res = await driversAPI.update(editingDriver._id, payload);
        setDrivers(drivers.map(d => d._id === editingDriver._id ? res.data : d));
      } else {
        const res = await driversAPI.create(payload);
        setDrivers([res.data, ...drivers]);
      }
      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name: "", email: "", phone: "", licenseNumber: "", experience: "", currentStatus: "Available" });
    } catch (err) {
      console.error("Driver save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this driver from the system?")) return;
    try {
      await driversAPI.delete(id);
      setDrivers(drivers.filter(d => d._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email || "",
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
      experience: driver.experience?.toString() || "",
      currentStatus: driver.currentStatus || "Available"
    });
    setShowModal(true);
  };

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === "All" || d.currentStatus === statusFilter)
  );

  const getScoreColor = (score) => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available": return "status-active";
      case "On Trip": return "status-warning";
      case "Off Duty": case "On Leave": return "status-offline";
      default: return "status-offline";
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>👤 Drivers</h1>
          <p>Manage fleet drivers - {drivers.length} registered</p>
        </div>
        <div className="page-header-right">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none", width: "220px" }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingDriver(null); setFormData({ name: "", email: "", phone: "", licenseNumber: "", experience: "", currentStatus: "Available" }); setShowModal(true); }}>
            ➕ Add Driver
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-spinner"></div>Loading drivers...</div>
      ) : error && filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>No Drivers Found</h3>
          <p>Add a new driver or check your connection.</p>
          <button className="btn btn-secondary" onClick={fetchDrivers} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((driver) => (
            <div className="card" key={driver._id} style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>{driver.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{driver.assignedVehicle || "Unassigned"}</div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: getScoreColor(driver.safetyScore), background: `${getScoreColor(driver.safetyScore)}15`, border: `2px solid ${getScoreColor(driver.safetyScore)}30` }}>
                  {driver.safetyScore}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</div>
                  <span className={`status-badge ${getStatusStyle(driver.currentStatus)}`}>
                    {driver.currentStatus === "Available" ? "🟢" : driver.currentStatus === "On Trip" ? "🟡" : "⭕"} {driver.currentStatus}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>License</div>
                  <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{driver.licenseNumber || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trips</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{driver.totalTrips || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Experience</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>{driver.experience || 0} yrs</div>
                </div>
              </div>
              {driver.email && <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>📧 {driver.email}</div>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(driver)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(driver._id)}>🗑️ Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter driver name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="driver@company.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91-9876543210" />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="DL-2024-001" />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.currentStatus} onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDriver ? "💾 Update Driver" : "➕ Add Driver"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Drivers;