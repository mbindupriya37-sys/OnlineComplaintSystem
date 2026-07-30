import React, { useMemo } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Unable to read user details:", error);
      return null;
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    navigate("/login", {
      replace: true
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          🏛 Smart Complaint
        </Link>
      </div>

      <ul className="nav-links">
        {!token ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/register">
                Register
              </Link>
            </li>

            <li>
              <Link to="/login">
                Login
              </Link>
            </li>
          </>
        ) : isAdmin ? (
          <>
            <li>
              <Link to="/admin">
                Admin Dashboard
              </Link>
            </li>

            <li>
              <Link to="/track">
                Track Complaint
              </Link>
            </li>

            <li>
              <Link to="/profile">
                Profile
              </Link>
            </li>

            <li className="navbar-user">
              👤 {user?.name || "Administrator"}
            </li>

            <li>
              <button
                className="logout-btn"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/dashboard">
                Dashboard
              </Link>
            </li>

            <li>
              <Link to="/create-complaint">
                New Complaint
              </Link>
            </li>

            <li>
              <Link to="/my-complaints">
                My Complaints
              </Link>
            </li>

            <li>
              <Link to="/track">
                Track
              </Link>
            </li>

            <li>
              <Link to="/profile">
                Profile
              </Link>
            </li>

            <li className="navbar-user">
              👤 {user?.name || "User"}
            </li>

            <li>
              <button
                className="logout-btn"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;