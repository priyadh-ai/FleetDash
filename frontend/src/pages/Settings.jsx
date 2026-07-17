import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../services/api";

function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [notifications, setNotifications] = useState({
    emailAlerts: true, smsAlerts: false, pushNotifications: true,
    criticalAlerts: true, maintenanceReminders: true, dailyReports: false
  });
  const [theme, setTheme] = useState("dark");
  const [mapProvider, setMapProvider] = useState("openstreetmap");
  const [refreshInterval, setRefreshInterval] = useState("10");
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setProfile({ name: user.name || "", email: user.email || "", role: user.role || "" });
  }, []);

  const handleSave = (message = "Settings saved successfully!") => {
    setSaveMessage(message);
    setSaved(true);
    setTimeout(() => { setSaved(false); setSaveMessage(""); }, 2500);
  };

  const handleProfileUpdate = async () => {
    try {
      // Update local storage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = profile.name;
      localStorage.setItem("user", JSON.stringify(user));
      handleSave("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage("Passwords do not match!");
      setSaved(true);
      setTimeout(() => { setSaved(false); setSaveMessage(""); }, 3000);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSaveMessage("Password must be at least 6 characters!");
      setSaved(true);
      setTimeout(() => { setSaved(false); setSaveMessage(""); }, 3000);
      return;
    }
    try {
      await authAPI.resetPassword("local", passwordData.newPassword);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      handleSave("Password changed successfully!");
    } catch (err) {
      setSaveMessage("Error changing password. Please try again.");
      setSaved(true);
      setTimeout(() => { setSaved(false); setSaveMessage(""); }, 3000);
    }
  };

  const sections = [
    { id: "general", label: "⚙️ General" },
    { id: "profile", label: "👤 Profile" },
    { id: "notifications", label: "🔔 Notifications" },
    { id: "display", label: "🎨 Display" },
    { id: "security", label: "🔒 Security" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>⚙️ Settings</h1>
          <p>Configure your FleetDash application settings</p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => { setActiveSection("general"); setSaved(false); setSaveMessage(""); }}>
            🔄 Reset
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          padding: "12px 20px", marginBottom: 20, borderRadius: 10,
          background: saveMessage.includes("not") ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
          border: `1px solid ${saveMessage.includes("not") ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
          color: saveMessage.includes("not") ? "#fca5a5" : "#86efac",
          fontSize: 13, fontWeight: 500
        }}>
          {saveMessage.includes("not") ? "⚠️" : "✅"} {saveMessage}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 12 }}>
          {sections.map((s) => (
            <div key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: "12px 16px", borderRadius: 10, cursor: "pointer",
              background: activeSection === s.id ? "rgba(99, 102, 241, 0.1)" : "transparent",
              color: activeSection === s.id ? "#6366f1" : "#94a3b8",
              fontWeight: activeSection === s.id ? 600 : 400, fontSize: 14,
              marginBottom: 4, transition: "all 0.2s",
              border: activeSection === s.id ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent"
            }}>
              {s.label}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24, minHeight: 400 }}>
          {activeSection === "general" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>General Settings</h2>
              <div className="form-group">
                <label>Application Name</label>
                <input type="text" defaultValue="FleetDash Enterprise" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Data Refresh Interval (seconds)</label>
                <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} style={{ width: "100%" }}>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default Map Center</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <input type="number" defaultValue={11.0168} step="0.01" placeholder="Latitude" />
                  <input type="number" defaultValue={76.9558} step="0.01" placeholder="Longitude" />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => handleSave()}>
                  {saved && saveMessage.includes("success") ? "✅ Saved!" : "💾 Save Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "profile" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Profile Settings</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile.email} disabled style={{ width: "100%", opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile.role} disabled style={{ width: "100%", opacity: 0.6 }} />
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={handleProfileUpdate}>
                  {saved && saveMessage.includes("Profile") ? "✅ Saved!" : "💾 Update Profile"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Notification Preferences</h2>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {key === "emailAlerts" && "Receive alerts via email"}
                      {key === "smsAlerts" && "Get SMS notifications for critical alerts"}
                      {key === "pushNotifications" && "Browser push notifications"}
                      {key === "criticalAlerts" && "Immediate notification for critical events"}
                      {key === "maintenanceReminders" && "Scheduled maintenance reminders"}
                      {key === "dailyReports" && "Daily fleet performance summary"}
                    </div>
                  </div>
                  <label style={{ width: 48, height: 26, background: value ? "#6366f1" : "rgba(255,255,255,0.1)", borderRadius: 13, cursor: "pointer", position: "relative", transition: "all 0.3s", flexShrink: 0 }}>
                    <input type="checkbox" checked={value} onChange={() => setNotifications({ ...notifications, [key]: !value })} style={{ display: "none" }} />
                    <span style={{ width: 22, height: 22, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: value ? 24 : 2, transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></span>
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => handleSave()}>
                  {saved && saveMessage.includes("success") ? "✅ Saved!" : "💾 Save Notification Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "display" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Display Settings</h2>
              <div className="form-group">
                <label>Theme</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["dark", "light", "system"].map((t) => (
                    <div key={t} onClick={() => setTheme(t)} style={{
                      flex: 1, padding: "16px", borderRadius: 12,
                      border: `2px solid ${theme === t ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                      background: theme === t ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                      cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{t === "dark" ? "🌙" : t === "light" ? "☀️" : "💻"}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", textTransform: "capitalize" }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Map Provider</label>
                <select value={mapProvider} onChange={(e) => setMapProvider(e.target.value)} style={{ width: "100%" }}>
                  <option value="openstreetmap">OpenStreetMap</option>
                  <option value="mapbox">Mapbox (requires API key)</option>
                  <option value="google">Google Maps (requires API key)</option>
                </select>
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => handleSave()}>
                  {saved && saveMessage.includes("success") ? "✅ Saved!" : "💾 Save Display Settings"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <h2 style={{ marginBottom: 20 }}>Security Settings</h2>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Enter current password" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="Enter new password (min 6 chars)" style={{ width: "100%" }} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="Confirm new password" style={{ width: "100%" }} />
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
                <button className="btn btn-primary" onClick={handlePasswordChange}>
                  {saved && saveMessage.includes("Password") ? "✅ Updated!" : "🔑 Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Settings;