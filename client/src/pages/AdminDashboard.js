import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:8000";

function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedComplaintId, setExpandedComplaintId] =
    useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingComplaintId, setUpdatingComplaintId] =
    useState("");
  const [deletingComplaintId, setDeletingComplaintId] =
    useState("");

  const clearSavedLogin = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
  }, []);

  const fetchAllComplaints = useCallback(async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        if (user.role !== "admin") {
          setMessage(
            "Access denied. Administrator account required."
          );
          setMessageType("error");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error(
          "Unable to read saved user details:",
          error
        );

        clearSavedLogin();
        navigate("/login");
        return;
      }
    }

    try {
      setIsLoading(true);
      setMessage("");
      setMessageType("");

      const response = await axios.get(
        `${SERVER_URL}/api/complaints/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      if (error.response?.status === 401) {
        clearSavedLogin();
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setMessage(
          "Access denied. Administrator account required."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to load complaints from the server."
        );
      }

      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [clearSavedLogin, navigate]);

  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  const statistics = useMemo(() => {
    return {
      total: complaints.length,

      pending: complaints.filter(
        (complaint) => complaint.status === "Pending"
      ).length,

      inProgress: complaints.filter(
        (complaint) => complaint.status === "In Progress"
      ).length,

      resolved: complaints.filter(
        (complaint) => complaint.status === "Resolved"
      ).length,

      highPriority: complaints.filter(
        (complaint) => complaint.priority === "High"
      ).length
    };
  }, [complaints]);

  const categories = useMemo(() => {
    return [
      ...new Set(
        complaints
          .map((complaint) => complaint.category)
          .filter(Boolean)
      )
    ].sort();
  }, [complaints]);

  const getProblemLocality = (complaint) => {
    return complaint.problemLocality?.trim() || "Not available";
  };

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return complaints
      .filter((complaint) => {
        const complaintId = complaint._id
          ? complaint._id.slice(-8).toLowerCase()
          : "";

        const title =
          complaint.title?.toLowerCase() || "";

        const description =
          complaint.description?.toLowerCase() || "";

        const category =
          complaint.category?.toLowerCase() || "";

        const userId =
          complaint.userId?.toString().toLowerCase() || "";

        const problemLocality =
          getProblemLocality(complaint).toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          category.includes(normalizedSearch) ||
          problemLocality.includes(normalizedSearch) ||
          userId.includes(normalizedSearch) ||
          complaintId.includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "All" ||
          complaint.status === statusFilter;

        const complaintPriority =
          complaint.priority || "Medium";

        const matchesPriority =
          priorityFilter === "All" ||
          complaintPriority === priorityFilter;

        const matchesCategory =
          categoryFilter === "All" ||
          complaint.category === categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory
        );
      })
      .sort(
        (firstComplaint, secondComplaint) =>
          new Date(secondComplaint.createdAt) -
          new Date(firstComplaint.createdAt)
      );
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter
  ]);

  const updateStatus = async (
    complaintId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingComplaintId(complaintId);
      setMessage("");
      setMessageType("");

      const response = await axios.put(
        `${SERVER_URL}/api/complaints/update-status/${complaintId}`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint._id === complaintId
            ? response.data.complaint
            : complaint
        )
      );

      setMessage(
        `Complaint status changed to ${newStatus}.`
      );
      setMessageType("success");
    } catch (error) {
      if (error.response?.status === 401) {
        clearSavedLogin();
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.message ||
          "Failed to update complaint status."
      );
      setMessageType("error");
    } finally {
      setUpdatingComplaintId("");
    }
  };
    const deleteComplaint = async (complaint) => {
    const shouldDelete = window.confirm(
      `Delete the complaint "${complaint.title}" permanently?`
    );

    if (!shouldDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setDeletingComplaintId(complaint._id);
      setMessage("");
      setMessageType("");

      await axios.delete(
        `${SERVER_URL}/api/complaints/delete/${complaint._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaints((currentComplaints) =>
        currentComplaints.filter(
          (currentComplaint) =>
            currentComplaint._id !== complaint._id
        )
      );

      if (expandedComplaintId === complaint._id) {
        setExpandedComplaintId(null);
      }

      setMessage("Complaint deleted successfully.");
      setMessageType("success");
    } catch (error) {
      if (error.response?.status === 401) {
        clearSavedLogin();
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.message ||
          "Failed to delete complaint."
      );
      setMessageType("error");
    } finally {
      setDeletingComplaintId("");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

  const toggleComplaintDetails = (complaintId) => {
    setExpandedComplaintId((currentId) =>
      currentId === complaintId
        ? null
        : complaintId
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "admin-status-badge admin-status-resolved";
    }

    if (status === "In Progress") {
      return "admin-status-badge admin-status-progress";
    }

    return "admin-status-badge admin-status-pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "admin-priority-badge admin-priority-high";
    }

    if (priority === "Low") {
      return "admin-priority-badge admin-priority-low";
    }

    return "admin-priority-badge admin-priority-medium";
  };

  const getComplaintImageUrl = (imageName) => {
    if (!imageName) {
      return "";
    }

    if (
      imageName.startsWith("http://") ||
      imageName.startsWith("https://")
    ) {
      return imageName;
    }

    const cleanedImageName = imageName
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    if (cleanedImageName.startsWith("uploads/")) {
      return `${SERVER_URL}/${cleanedImageName}`;
    }

    return `${SERVER_URL}/uploads/${cleanedImageName}`;
  };

  const handleLogout = () => {
    clearSavedLogin();
    navigate("/login");
  };

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-header">
        <div>
          <p className="admin-dashboard-eyebrow">
            ADMINISTRATION CONTROL PANEL
          </p>

          <h1>Admin Dashboard</h1>

          <p>
            Review complaints, inspect uploaded evidence,
            update progress, and monitor overall complaint
            resolution performance.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <Link className="admin-home-link" to="/">
            Public Website
          </Link>

          <button
            className="admin-logout-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>

      <section className="admin-statistics">
        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-total">
            📋
          </span>

          <div>
            <p>Total Complaints</p>
            <h2>{statistics.total}</h2>
          </div>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-pending">
            ⏳
          </span>

          <div>
            <p>Pending</p>
            <h2>{statistics.pending}</h2>
          </div>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-progress">
            ↻
          </span>

          <div>
            <p>In Progress</p>
            <h2>{statistics.inProgress}</h2>
          </div>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-resolved">
            ✓
          </span>

          <div>
            <p>Resolved</p>
            <h2>{statistics.resolved}</h2>
          </div>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-priority">
            !
          </span>

          <div>
            <p>High Priority</p>
            <h2>{statistics.highPriority}</h2>
          </div>
        </article>
      </section>

      <section className="admin-dashboard-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-panel-label">
              COMPLAINT MANAGEMENT
            </p>

            <h2>Search and Manage Complaints</h2>
          </div>

          <button
            className="admin-refresh-button"
            type="button"
            onClick={fetchAllComplaints}
            disabled={isLoading}
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh Data"}
          </button>
        </div>

        <div className="admin-filter-grid">
          <div className="admin-filter-group admin-search-group">
            <label htmlFor="admin-search">
              Search
            </label>

            <input
              id="admin-search"
              type="search"
              placeholder="Search title, category, locality, complaint ID or user ID"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="admin-filter-group">
            <label htmlFor="admin-status-filter">
              Status
            </label>

            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label htmlFor="admin-priority-filter">
              Priority
            </label>

            <select
              id="admin-priority-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label htmlFor="admin-category-filter">
              Category
            </label>

            <select
              id="admin-category-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="All">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-filter-footer">
          <p>
            Showing{" "}
            <strong>{filteredComplaints.length}</strong>{" "}
            of <strong>{complaints.length}</strong>{" "}
            complaints
          </p>

          <button
            className="admin-clear-filters-button"
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {message && (
          <div
            className={
              messageType === "success"
                ? "admin-message admin-message-success"
                : "admin-message admin-message-error"
            }
          >
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="admin-empty-state">
            <div className="admin-loader"></div>

            <h3>Loading complaints...</h3>

            <p>
              Please wait while complaint records are
              retrieved.
            </p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📭</div>

            <h3>No complaints found</h3>

            <p>
              No complaint records match the selected search
              and filters.
            </p>

            <button
              className="admin-clear-filters-button"
              type="button"
              onClick={clearFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
                    <div className="admin-complaints-list">
            {filteredComplaints.map((complaint) => {
              const priority =
                complaint.priority || "Medium";

              const shortId = complaint._id
                ? complaint._id
                    .slice(-8)
                    .toUpperCase()
                : "UNKNOWN";

              const isExpanded =
                expandedComplaintId === complaint._id;

              const complaintImageUrl =
                getComplaintImageUrl(complaint.image);

              const problemLocality =
                getProblemLocality(complaint);

              return (
                <article
                  className="admin-complaint-card"
                  key={complaint._id}
                >
                  <div className="admin-complaint-top">
                    <div className="admin-complaint-heading">
                      <span className="admin-complaint-id">
                        OCRS-{shortId}
                      </span>

                      <h3>{complaint.title}</h3>

                      <p>{complaint.category}</p>
                    </div>

                    <div className="admin-complaint-badges">
                      <span
                        className={getPriorityClass(
                          priority
                        )}
                      >
                        {priority} Priority
                      </span>

                      <span
                        className={getStatusClass(
                          complaint.status
                        )}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  <div className="admin-complaint-meta">
                    <div>
                      <span>User ID</span>
                      <strong>{complaint.userId}</strong>
                    </div>

                    <div>
                      <span>Submitted</span>
                      <strong>
                        {formatDate(complaint.createdAt)}
                      </strong>
                    </div>

                    <div>
                      <span>Last Updated</span>
                      <strong>
                        {formatDate(complaint.updatedAt)}
                      </strong>
                    </div>

                    <div>
                      <span>Category</span>
                      <strong>
                        {complaint.category}
                      </strong>
                    </div>

                    <div>
                      <span>Problem Locality</span>
                      <strong>{problemLocality}</strong>
                    </div>
                  </div>

                  <div className="admin-management-section">
                    <div className="admin-status-control">
                      <label
                        htmlFor={`status-${complaint._id}`}
                      >
                        Update Status
                      </label>

                      <select
                        id={`status-${complaint._id}`}
                        value={complaint.status}
                        disabled={
                          updatingComplaintId ===
                          complaint._id
                        }
                        onChange={(event) =>
                          updateStatus(
                            complaint._id,
                            event.target.value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>
                      </select>

                      {updatingComplaintId ===
                        complaint._id && (
                        <span className="admin-updating-text">
                          Updating...
                        </span>
                      )}
                    </div>

                    <div className="admin-card-actions">
                      <button
                        className="admin-details-button"
                        type="button"
                        onClick={() =>
                          toggleComplaintDetails(
                            complaint._id
                          )
                        }
                      >
                        {isExpanded
                          ? "Hide Details"
                          : "View Details"}
                      </button>

                      <button
                        className="admin-delete-button"
                        type="button"
                        disabled={
                          deletingComplaintId ===
                          complaint._id
                        }
                        onClick={() =>
                          deleteComplaint(complaint)
                        }
                      >
                        {deletingComplaintId ===
                        complaint._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="admin-complaint-details">
                      {complaintImageUrl ? (
                        <div className="admin-complaint-evidence">
                          <div className="admin-evidence-header">
                            <div>
                              <p className="admin-evidence-label">
                                PHOTO EVIDENCE
                              </p>

                              <h4>
                                Uploaded Complaint Image
                              </h4>
                            </div>

                            <a
                              className="admin-evidence-open-link"
                              href={complaintImageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Full Image
                            </a>
                          </div>

                          <div className="admin-evidence-image-wrapper">
                            <img
                              className="admin-evidence-image"
                              src={complaintImageUrl}
                              alt={`Evidence for ${complaint.title}`}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";

                                const fallback =
                                  event.currentTarget
                                    .nextElementSibling;

                                if (fallback) {
                                  fallback.style.display =
                                    "flex";
                                }
                              }}
                            />

                            <div
                              className="admin-evidence-fallback"
                              style={{
                                display: "none"
                              }}
                            >
                              <span>🖼️</span>

                              <div>
                                <h4>
                                  Image could not be loaded
                                </h4>

                                <p>
                                  Check that the backend is
                                  running and the uploads folder
                                  is publicly accessible.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="admin-no-evidence">
                          <span>📷</span>

                          <div>
                            <h4>No photo evidence</h4>

                            <p>
                              This complaint was submitted
                              without an image attachment.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="admin-description-section">
                        <h4>Complaint Description</h4>
                        <p>{complaint.description}</p>
                      </div>

                      <div className="admin-detail-grid">
                        <div>
                          <span>Complaint ID</span>

                          <strong>
                            OCRS-{shortId}
                          </strong>
                        </div>

                        <div>
                          <span>MongoDB Record ID</span>

                          <strong>
                            {complaint._id}
                          </strong>
                        </div>

                        <div>
                          <span>User ID</span>

                          <strong>
                            {complaint.userId}
                          </strong>
                        </div>

                        <div>
                          <span>Priority</span>

                          <strong>{priority}</strong>
                        </div>

                        <div>
                          <span>Current Status</span>

                          <strong>
                            {complaint.status}
                          </strong>
                        </div>

                        <div>
                          <span>Category</span>

                          <strong>
                            {complaint.category}
                          </strong>
                        </div>

                        <div>
                          <span>Problem Locality</span>

                          <strong>
                            {problemLocality}
                          </strong>
                        </div>

                        <div>
                          <span>Submitted</span>

                          <strong>
                            {formatDate(
                              complaint.createdAt
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Last Updated</span>

                          <strong>
                            {formatDate(
                              complaint.updatedAt
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;