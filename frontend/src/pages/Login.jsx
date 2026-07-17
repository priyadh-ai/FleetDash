import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const demoCredentials = [
    { email: "admin@fleetdash.com", password: "123456", role: "Admin" },
    { email: "manager@fleetdash.com", password: "123456", role: "Manager" },
    { email: "driver@fleetdash.com", password: "123456", role: "Driver" },
  ];

  useEffect(() => {
    // Auto-focus on email field
    if (emailRef.current) emailRef.current.focus();
    // Check if already logged in
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;

      // Save auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        setError(msg);
      } else if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (creds) => {
    setEmail(creds.email);
    setPassword(creds.password);
    setShowDemo(false);
    // Auto-focus password after filling
    setTimeout(() => {
      const pwField = document.querySelector(".login-password-input");
      pwField?.focus();
    }, 100);
  };

  return (
    <div className="login-page">
      {/* Background Decorations */}
      <div className="login-bg-shapes">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
        <div className="bg-shape bg-shape-4"></div>
      </div>

      <div className="login-container">
        {/* Left Panel - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="branding-logo">
              <div className="logo-icon-main">🚛</div>
            </div>
            <h1 className="branding-title">FleetDash</h1>
            <p className="branding-subtitle">Enterprise Fleet Management Platform</p>
            <div className="branding-features">
              <div className="branding-feature">
                <span className="feature-icon">📊</span>
                <span>Real-Time Fleet Monitoring</span>
              </div>
              <div className="branding-feature">
                <span className="feature-icon">🛡️</span>
                <span>AI-Powered Predictive Analytics</span>
              </div>
              <div className="branding-feature">
                <span className="feature-icon">🔒</span>
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="branding-feature">
                <span className="feature-icon">🌍</span>
                <span>Multi-Location Support</span>
              </div>
            </div>
            <div className="branding-footer">
              <p>© 2026 FleetDash Inc. All rights reserved.</p>
              <p>Enterprise SaaS v3.0</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <div className="mobile-logo">
                <span className="mobile-logo-icon">🚛</span>
                <span className="mobile-logo-text">FleetDash</span>
              </div>
              <h2 className="login-welcome">Welcome Back</h2>
              <p className="login-instruction">Sign in to your FleetDash account</p>
            </div>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              {error && (
                <div className="login-error" role="alert">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                  <button
                    type="button"
                    className="error-close"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="login-email" className="field-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    className="login-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    aria-required="true"
                    aria-describedby={error ? "login-error" : undefined}
                  />
                  {email && (
                    <button
                      type="button"
                      className="input-clear"
                      onClick={() => setEmail("")}
                      tabIndex={-1}
                      aria-label="Clear email"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="login-password" className="field-label">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="login-input login-password-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="remember-text">Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className={`login-submit ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="login-demo">
              <button
                className="demo-toggle"
                onClick={() => setShowDemo(!showDemo)}
                type="button"
                aria-expanded={showDemo}
              >
                <span>🔑</span>
                <span>Demo Credentials</span>
                <span className={`demo-chevron ${showDemo ? "open" : ""}`}>▼</span>
              </button>
              {showDemo && (
                <div className="demo-card">
                  <p className="demo-title">Quick Login for Testing</p>
                  {demoCredentials.map((creds) => (
                    <button
                      key={creds.email}
                      type="button"
                      className="demo-item"
                      onClick={() => fillDemoCredentials(creds)}
                    >
                      <div className="demo-role-badge" data-role={creds.role.toLowerCase()}>
                        {creds.role === "Admin" ? "🛡️" : creds.role === "Manager" ? "📋" : "🚛"}
                      </div>
                      <div className="demo-info">
                        <span className="demo-role-label">{creds.role}</span>
                        <span className="demo-email">{creds.email}</span>
                        <span className="demo-password">Password: {creds.password}</span>
                      </div>
                      <span className="demo-click">Click →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="login-footer-mobile">
              <p>© 2026 FleetDash Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;