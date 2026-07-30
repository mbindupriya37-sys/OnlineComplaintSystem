import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim() || !password) {
      return "Please enter your email address and password.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email: formData.email,
          password: formData.password
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("rememberMe", String(rememberMe));

      setMessage("Login successful. Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage(
          "Unable to connect to the server. Please confirm that the backend is running."
        );
      }

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setMessage(
      "Forgot-password recovery will be added as a future enhancement."
    );
    setMessageType("info");
  };

  const handleGoogleLogin = () => {
    setMessage(
      "Google Sign-In requires Google OAuth configuration and will be added later."
    );
    setMessageType("info");
  };

  return (
    <main className="login-page">
      <section className="login-information">
        <div className="login-brand-mark">OCRS</div>

        <p className="login-eyebrow">SECURE CITIZEN PORTAL</p>

        <h1>Welcome Back</h1>

        <p className="login-intro-text">
          Access the Online Complaint Registration System to submit complaints,
          monitor progress, and receive transparent resolution updates.
        </p>

        <div className="login-feature-list">
          <div className="login-feature-item">
            <span>✓</span>

            <div>
              <h3>Secure Authentication</h3>
              <p>Your account is protected using encrypted passwords and JWT.</p>
            </div>
          </div>

          <div className="login-feature-item">
            <span>✓</span>

            <div>
              <h3>Complaint Tracking</h3>
              <p>Monitor pending, in-progress, and resolved complaints.</p>
            </div>
          </div>

          <div className="login-feature-item">
            <span>✓</span>

            <div>
              <h3>Transparent Updates</h3>
              <p>View complaint priority and status updates in one place.</p>
            </div>
          </div>
        </div>

        <div className="login-security-note">
          <strong>Privacy protected</strong>
          <p>
            Your login credentials and personal information are never displayed
            publicly.
          </p>
        </div>
      </section>

      <section className="login-card-wrapper">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-form-header">
            <p className="login-small-label">ACCOUNT LOGIN</p>

            <h2>Sign in to continue</h2>

            <p>
              Enter the credentials associated with your registered account.
            </p>
          </div>

          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <div className="login-password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label="Show or hide password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />

              <span>Remember me</span>
            </label>

            <button
              className="forgot-password-button"
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <div
              className={`login-message ${
                messageType === "success"
                  ? "login-message-success"
                  : messageType === "info"
                    ? "login-message-info"
                    : "login-message-error"
              }`}
            >
              {message}
            </div>
          )}

          <button
            className="login-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button
            className="google-login-button"
            type="button"
            onClick={handleGoogleLogin}
          >
            <span className="google-letter">G</span>
            Continue with Google
          </button>

          <p className="login-register-link">
            Do not have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>

          <Link className="return-home-link" to="/">
            ← Return to Home
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Login;