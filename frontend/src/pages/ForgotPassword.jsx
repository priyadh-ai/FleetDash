import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await authAPI.forgotPassword(email);
            setMessage(response.data.message || "Password reset email sent! Check your inbox.");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <form className="forgot-password-box" onSubmit={handleSubmit}>
                <h2>🔑 Reset Password</h2>
                <p>Enter your email address and we will send you a password reset link.</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {message && <p className="success-msg">{message}</p>}
                {error && <p className="error-msg">{error}</p>}

                <button disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="back-to-login">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;