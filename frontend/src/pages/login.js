// frontend/src/pages/Login.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import "./Auth.css";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ use login from context

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form on input changes
  useEffect(() => {
    const isValid =
      formData.email.trim() !== "" && formData.password.trim() !== "";
    setIsFormValid(isValid && !isLoading);
  }, [formData, isLoading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting to login with email:", formData.email);
      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Login successful, response:", response);

      // ✅ Get token and user from response (instead of only from localStorage)
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token) {
        throw new Error("No authentication token received");
      }

      // ✅ Update context (this triggers rerender of routes/navbar)
      login(token, user);

      setError("Login successful! Redirecting...");
      console.log("Navigating to /profile");
      navigate("/profile");
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        response: err.response
          ? {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
            }
          : "No response data",
      });

      let errorMessage =
        "Login failed. Please check your credentials and try again.";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.response.status === 400) {
          if (err.response.data && typeof err.response.data === "object") {
            const errorMessages = [];
            for (const [field, errors] of Object.entries(err.response.data)) {
              if (Array.isArray(errors)) {
                errorMessages.push(`${field}: ${errors.join(", ")}`);
              } else if (typeof errors === "string") {
                errorMessages.push(errors);
              }
            }
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join("\n");
            }
          } else if (err.response.data?.error) {
            errorMessage = err.response.data.error;
          }
        } else if (err.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.request) {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your account</p>
        </div>

        {error && (
          <div
            className={`alert ${
              error.includes("success") ? "alert-success" : "alert-error"
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className={`form-group ${formData.email ? "has-value" : ""}`}>
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="username email"
                autoFocus
                required
              />
            </div>
          </div>

          <div className={`form-group ${formData.password ? "has-value" : ""}`}>
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${
              !isFormValid ? "btn-disabled" : ""
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button type="button" className="btn btn-google">
              <i className="fab fa-google"></i>
              <span>Google</span>
            </button>
            <button type="button" className="btn btn-facebook">
              <i className="fab fa-facebook-f"></i>
              <span>Facebook</span>
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
