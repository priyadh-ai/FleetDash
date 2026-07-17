import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import { adminAPI, alertsAPI, vehiclesAPI } from "../services/api";

function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "Viewer" });
  const [stats, setStats] = useState({ totalAlerts: 0, totalVehicles: 0, activeVehicles: 0, unacknowledgedAlerts: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, vehiclesRes, alertsRes] = await Promise.allSettled([
        adminAPI.getUsers(),
        vehiclesAPI.getAll(),
        alertsAPI.getStats()
      ]);

      if (userRes.status === "fulfilled") setUsers(userRes.value.data || []);
      if (vehiclesRes.status === "fulfilled") {
        const v = vehiclesRes.value.data || [];
        setStats(prev => ({ ...prev, totalVehicles: v.length, activeVehicles: v.filter(x => x.status === "Active").length }));
      }
      if (alertsRes.status === "fulfilled") {
        const a = alertsRes.value.data;
        setStats(prev => ({ ...prev, totalAlerts: a?.total || 0, unacknowledgedAlerts: a?.unacknowledged || 0 }));
      }

      // System health from server
      try {
        const healthRes = await fetch("/api/health").then(r => r.json());
        setSystemHealth(healthRes);
      } catch {}
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser._id, userForm);
        setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...userForm } : u));
      } else {
        const res = await adminAPI.createUser(userForm);
        setUsers([...users, res.data]);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", role: "Viewer" });
    } catch (err) {
      console.error("User save error:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  const tabs = [
    { id: "users", label: "👥 User Management" },
    { id: "audit", label: "📋 Audit Log" },
    { id: "system", label: "⚙️ System Health" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>🛡️ Admin Panel</h1>
          <p>System administration, user management and audit logs</p>
        </div>
      </div>

      <div className="cc-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button key={tab.id} className={`cc-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ color: "#64748b", fontSize: 13 }}>{users.length} registered users</p>
            <button className="btn btn-primary" onClick={() => { setEditingUser(null); setUserForm({ name: "", email: "", password: "", role: "Viewer" }); setShowUserModal(true); }}>
              ➕ Add User
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center", color: "#64748b", padding: 24 }}>No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 6,
                          background: user.role === "Admin" ? "rgba(99,102,241,0.1)" : user.role === "Manager" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                          color: user.role === "Admin" ? "#6366f1" : user.role === "Manager" ? "#f59e0b" : "#22c55e"
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td><span className={`status-badge status-active`}>🟢 Active</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingUser(user); setUserForm({ name: user.name, email: user.email, password: "", role: user.role }); setShowUserModal(true); }}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {auditLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Audit Logs</h3>
              <p>Audit logs will appear here as system events occur.</p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log._id || log.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderLeft: `3px solid ${log.severity === "warning" ? "#f59e0b" : "#3b82f6"}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: log.severity === "warning" ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {log.severity === "warning" ? "⚠️" : "ℹ️"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                    <strong>{log.user || log.action}</strong> — {log.details || log.action}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{log.timestamp || new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "system" && (
        <div className="grid-2">
          {[
            { label: "Server Status", value: systemHealth?.status === "ok" ? "Online" : "Checking...", icon: systemHealth?.status === "ok" ? "🟢" : "🟡", color: systemHealth?.status === "ok" ? "#22c55e" : "#f59e0b" },
            { label: "Database", value: "Connected", icon: "✅", color: "#22c55e" },
            { label: "Uptime", value: systemHealth?.uptime ? `${Math.floor(systemHealth.uptime / 60)}m` : "N/A", icon: "📈", color: "#3b82f6" },
            { label: "Total Vehicles", value: stats.totalVehicles, icon: "🚛", color: "#6366f1" },
            { label: "Active Vehicles", value: stats.activeVehicles, icon: "🟢", color: "#22c55e" },
            { label: "Total Alerts", value: stats.totalAlerts, icon: "🔔", color: "#f59e0b" },
            { label: "Unacknowledged", value: stats.unacknowledgedAlerts, icon: "⚠️", color: "#ef4444" },
            { label: "Registered Users", value: users.length, icon: "👥", color: "#06b6d4" },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add User"}</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group"><label>Name</label><input type="text" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
              <div className="form-group"><label>Email</label><input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
              {!editingUser && <div className="form-group"><label>Password</label><input type="password" required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>}
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Driver">Driver</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? "💾 Update" : "➕ Add User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Admin;