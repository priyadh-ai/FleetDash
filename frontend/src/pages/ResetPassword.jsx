import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./ForgotPassword.css";

function ResetPassword() {
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.resetPassword(resetToken, password);
            setMessage("Password reset successful! Redirecting to dashboard...");
            const { token, user } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. The link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <form className="forgot-password-box" onSubmit={handleSubmit}>
                <h2>🔐 Set New Password</h2>
                <p>Enter your new password below.</p>

                <div className="password-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                />

                {message && <p className="success-msg">{message}</p>}
                {error && <p className="error-msg">{error}</p>}

                <button disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="back-to-login">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;