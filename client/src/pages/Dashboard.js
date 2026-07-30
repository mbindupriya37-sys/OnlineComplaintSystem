import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.log("Unable to read saved user information:", error);
      }
    }

    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/complaints/mycomplaints",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setComplaints(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setMessage(
          error.response?.data?.message ||
            "Unable to load your complaint dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

  const statistics = useMemo(() => {
    const total = complaints.length;

    const pending = complaints.filter(
      (complaint) => complaint.status === "Pending"
    ).length;

    const inProgress = complaints.filter(
      (complaint) => complaint.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (complaint) => complaint.status === "Resolved"
    ).length;

    const highPriority = complaints.filter(
      (complaint) => complaint.priority === "High"
    ).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      highPriority
    };
  }, [complaints]);

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort(
        (firstComplaint, secondComplaint) =>
          new Date(secondComplaint.createdAt) -
          new Date(firstComplaint.createdAt)
      )
      .slice(0, 5);
  }, [complaints]);

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "dashboard-status dashboard-status-resolved";
    }

    if (status === "In Progress") {
      return "dashboard-status dashboard-status-progress";
    }

    return "dashboard-status dashboard-status-pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "dashboard-priority dashboard-priority-high";
    }

    if (priority === "Low") {
      return "dashboard-priority dashboard-priority-low";
    }

    return "dashboard-priority dashboard-priority-medium";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="dashboard-eyebrow">CITIZEN DASHBOARD</p>

          <h1>
            Welcome back,{" "}
            <span>{user?.name || "Citizen"}</span>
          </h1>

          <p>
            View complaint statistics, track recent requests, and access all
            complaint services from one secure dashboard.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link
            className="dashboard-primary-action"
            to="/create-complaint"
          >
            + Register Complaint
          </Link>

          <button
            className="dashboard-logout-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>

      {message && (
        <div className="dashboard-message dashboard-message-error">
          {message}
        </div>
      )}

      <section className="dashboard-statistics">
        <article className="dashboard-stat-card dashboard-stat-total">
          <div className="dashboard-stat-icon">📋</div>

          <div>
            <p>Total Complaints</p>
            <h2>{statistics.total}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card dashboard-stat-pending">
          <div className="dashboard-stat-icon">⏳</div>

          <div>
            <p>Pending</p>
            <h2>{statistics.pending}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card dashboard-stat-progress">
          <div className="dashboard-stat-icon">🔄</div>

          <div>
            <p>In Progress</p>
            <h2>{statistics.inProgress}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card dashboard-stat-resolved">
          <div className="dashboard-stat-icon">✓</div>

          <div>
            <p>Resolved</p>
            <h2>{statistics.resolved}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card dashboard-stat-priority">
          <div className="dashboard-stat-icon">!</div>

          <div>
            <p>High Priority</p>
            <h2>{statistics.highPriority}</h2>
          </div>
        </article>
      </section>

      <section className="dashboard-content-grid">
        <article className="dashboard-panel dashboard-quick-actions">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-label">QUICK SERVICES</p>
              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="dashboard-action-grid">
            <Link
              className="dashboard-action-card"
              to="/create-complaint"
            >
              <div className="dashboard-action-icon dashboard-action-blue">
                +
              </div>

              <div>
                <h3>Register Complaint</h3>
                <p>Submit a new complaint with category and priority.</p>
              </div>

              <span>→</span>
            </Link>

            <Link
              className="dashboard-action-card"
              to="/my-complaints"
            >
              <div className="dashboard-action-icon dashboard-action-green">
                ⌕
              </div>

              <div>
                <h3>Track Complaints</h3>
                <p>View the current status of your submitted complaints.</p>
              </div>

              <span>→</span>
            </Link>

            <Link
              className="dashboard-action-card"
              to="/my-complaints"
            >
              <div className="dashboard-action-icon dashboard-action-purple">
                ↻
              </div>

              <div>
                <h3>Complaint History</h3>
                <p>Review all previous complaints and resolution updates.</p>
              </div>

              <span>→</span>
            </Link>

            <button
              className="dashboard-action-card dashboard-action-button"
              type="button"
              onClick={() =>
                setMessage(
                  "Profile management will be added in the upcoming step."
                )
              }
            >
              <div className="dashboard-action-icon dashboard-action-orange">
                👤
              </div>

              <div>
                <h3>My Profile</h3>
                <p>View and update personal and contact information.</p>
              </div>

              <span>→</span>
            </button>
          </div>
        </article>

        <aside className="dashboard-panel dashboard-account-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-label">ACCOUNT SUMMARY</p>
              <h2>Your Information</h2>
            </div>
          </div>

          <div className="dashboard-profile-circle">
            {(user?.name || "C")
              .charAt(0)
              .toUpperCase()}
          </div>

          <h3>{user?.name || "Citizen"}</h3>
          <p>{user?.email || "Email unavailable"}</p>

          <div className="dashboard-account-details">
            <div>
              <span>Role</span>
              <strong>
                {user?.role === "admin" ? "Administrator" : "Citizen"}
              </strong>
            </div>

            <div>
              <span>Mobile</span>
              <strong>{user?.mobile || "Not available"}</strong>
            </div>

            <div>
              <span>City</span>
              <strong>{user?.city || "Not available"}</strong>
            </div>

            <div>
              <span>Account Status</span>
              <strong className="dashboard-account-active">Active</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="dashboard-panel dashboard-recent-section">
        <div className="dashboard-panel-header dashboard-recent-header">
          <div>
            <p className="dashboard-panel-label">LATEST ACTIVITY</p>
            <h2>Recent Complaints</h2>
          </div>

          <Link
            className="dashboard-view-all"
            to="/my-complaints"
          >
            View All Complaints →
          </Link>
        </div>

        {isLoading ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-loader"></div>
            <h3>Loading complaints...</h3>
            <p>Please wait while we prepare your dashboard.</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">📭</div>

            <h3>No complaints registered yet</h3>

            <p>
              Submit your first complaint and track its complete resolution
              progress from this dashboard.
            </p>

            <Link
              className="dashboard-primary-action"
              to="/create-complaint"
            >
              Register Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {recentComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div className="dashboard-complaint-title">
                        <strong>{complaint.title}</strong>

                        <span>
                          ID: {complaint._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td>{complaint.category}</td>

                    <td>
                      <span
                        className={getPriorityClass(
                          complaint.priority || "Medium"
                        )}
                      >
                        {complaint.priority || "Medium"}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusClass(complaint.status)}>
                        {complaint.status}
                      </span>
                    </td>

                    <td>{formatDate(complaint.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;