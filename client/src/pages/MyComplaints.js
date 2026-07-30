import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:8000";

function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        setMessage("");

        const response = await axios.get(
          `${SERVER_URL}/api/complaints/mycomplaints`,
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("rememberMe");

          navigate("/login");
          return;
        }

        setMessage(
          error.response?.data?.message ||
            "Failed to load complaints."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

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
      ).length
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return complaints
      .filter((complaint) => {
        const complaintId = complaint._id
          ? complaint._id.slice(-8).toLowerCase()
          : "";

        const title = complaint.title?.toLowerCase() || "";
        const description =
          complaint.description?.toLowerCase() || "";
        const category = complaint.category?.toLowerCase() || "";
        const problemLocality =
          complaint.problemLocality?.toLowerCase() || "";

        const matchesSearch =
          !normalizedSearch ||
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch) ||
          category.includes(normalizedSearch) ||
          problemLocality.includes(normalizedSearch) ||
          complaintId.includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "All" ||
          complaint.status === statusFilter;

        const complaintPriority =
          complaint.priority || "Medium";

        const matchesPriority =
          priorityFilter === "All" ||
          complaintPriority === priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
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
    priorityFilter
  ]);

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

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "my-status-badge my-status-resolved";
    }

    if (status === "In Progress") {
      return "my-status-badge my-status-progress";
    }

    return "my-status-badge my-status-pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "my-priority-badge my-priority-high";
    }

    if (priority === "Low") {
      return "my-priority-badge my-priority-low";
    }

    return "my-priority-badge my-priority-medium";
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

  const getProblemLocality = (complaint) => {
    if (
      complaint.problemLocality &&
      complaint.problemLocality.trim()
    ) {
      return complaint.problemLocality.trim();
    }

    return "Not provided";
  };

  const toggleComplaintDetails = (complaintId) => {
    setExpandedComplaintId((currentId) =>
      currentId === complaintId ? null : complaintId
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  };

  return (
    <main className="my-complaints-page">
      <section className="my-complaints-header">
        <div>
          <p className="my-complaints-eyebrow">
            COMPLAINT TRACKING
          </p>

          <h1>My Complaints</h1>

          <p>
            Search, filter, and review the complete status of
            all complaints submitted through your account.
          </p>
        </div>

        <div className="my-complaints-header-actions">
          <Link
            className="my-complaints-secondary-link"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="my-complaints-primary-link"
            to="/create-complaint"
          >
            + New Complaint
          </Link>
        </div>
      </section>

      <section className="my-complaints-stats">
        <article className="my-stat-card">
          <span className="my-stat-icon my-stat-total">
            📋
          </span>

          <div>
            <p>Total</p>
            <h2>{statistics.total}</h2>
          </div>
        </article>

        <article className="my-stat-card">
          <span className="my-stat-icon my-stat-pending">
            ⏳
          </span>

          <div>
            <p>Pending</p>
            <h2>{statistics.pending}</h2>
          </div>
        </article>

        <article className="my-stat-card">
          <span className="my-stat-icon my-stat-progress">
            ↻
          </span>

          <div>
            <p>In Progress</p>
            <h2>{statistics.inProgress}</h2>
          </div>
        </article>

        <article className="my-stat-card">
          <span className="my-stat-icon my-stat-resolved">
            ✓
          </span>

          <div>
            <p>Resolved</p>
            <h2>{statistics.resolved}</h2>
          </div>
        </article>
      </section>

      <section className="my-complaints-panel">
        <div className="my-complaints-panel-header">
          <div>
            <p className="my-panel-label">
              SEARCH AND FILTER
            </p>

            <h2>Find a Complaint</h2>
          </div>

          <button
            className="my-clear-filters-button"
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="my-filter-grid">
          <div className="my-filter-group my-search-group">
            <label htmlFor="complaint-search">
              Search
            </label>

            <input
              id="complaint-search"
              type="search"
              placeholder="Search by title, locality, category, description or complaint ID"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="my-filter-group">
            <label htmlFor="status-filter">
              Status
            </label>

            <select
              id="status-filter"
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

          <div className="my-filter-group">
            <label htmlFor="priority-filter">
              Priority
            </label>

            <select
              id="priority-filter"
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
        </div>

        {message && (
          <div className="my-complaints-message my-complaints-error">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="my-complaints-empty-state">
            <div className="my-complaints-loader"></div>

            <h3>Loading your complaints...</h3>

            <p>
              Please wait while we retrieve your complaint
              history.
            </p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="my-complaints-empty-state">
            <div className="my-empty-icon">📭</div>

            <h3>No complaints found</h3>

            <p>
              No complaints match the selected search and
              filter options.
            </p>

            {complaints.length === 0 ? (
              <Link
                className="my-complaints-primary-link"
                to="/create-complaint"
              >
                Register Your First Complaint
              </Link>
            ) : (
              <button
                className="my-clear-filters-button"
                type="button"
                onClick={clearFilters}
              >
                Reset Search and Filters
              </button>
            )}
          </div>
        ) : (
          <div className="my-complaints-list">
            {filteredComplaints.map((complaint) => {
              const complaintPriority =
                complaint.priority || "Medium";

              const complaintId = complaint._id
                ? complaint._id.slice(-8).toUpperCase()
                : "UNKNOWN";

              const isExpanded =
                expandedComplaintId === complaint._id;

              const complaintImageUrl =
                getComplaintImageUrl(complaint.image);

              const problemLocality =
                getProblemLocality(complaint);

              return (
                <article
                  className="my-complaint-card"
                  key={complaint._id}
                >
                  <div className="my-complaint-main">
                    <div className="my-complaint-title-section">
                      <div className="my-complaint-id">
                        OCRS-{complaintId}
                      </div>

                      <h3>{complaint.title}</h3>

                      <p>{complaint.category}</p>
                    </div>

                    <div className="my-complaint-badges">
                      <span
                        className={getPriorityClass(
                          complaintPriority
                        )}
                      >
                        {complaintPriority} Priority
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

                  <div className="my-complaint-meta">
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

                      <strong>{complaint.category}</strong>
                    </div>

                    <div>
                      <span>Problem Locality</span>

                      <strong>{problemLocality}</strong>
                    </div>
                  </div>

                  <div className="my-complaint-progress">
                    <div
                      className={
                        complaint.status === "Pending" ||
                        complaint.status === "In Progress" ||
                        complaint.status === "Resolved"
                          ? "my-progress-step my-progress-active"
                          : "my-progress-step"
                      }
                    >
                      <span>1</span>
                      <p>Submitted</p>
                    </div>

                    <div
                      className={
                        complaint.status === "In Progress" ||
                        complaint.status === "Resolved"
                          ? "my-progress-line my-progress-line-active"
                          : "my-progress-line"
                      }
                    ></div>

                    <div
                      className={
                        complaint.status === "In Progress" ||
                        complaint.status === "Resolved"
                          ? "my-progress-step my-progress-active"
                          : "my-progress-step"
                      }
                    >
                      <span>2</span>
                      <p>In Progress</p>
                    </div>

                    <div
                      className={
                        complaint.status === "Resolved"
                          ? "my-progress-line my-progress-line-active"
                          : "my-progress-line"
                      }
                    ></div>

                    <div
                      className={
                        complaint.status === "Resolved"
                          ? "my-progress-step my-progress-active"
                          : "my-progress-step"
                      }
                    >
                      <span>3</span>
                      <p>Resolved</p>
                    </div>
                  </div>

                  <button
                    className="my-view-details-button"
                    type="button"
                    onClick={() =>
                      toggleComplaintDetails(complaint._id)
                    }
                  >
                    {isExpanded
                      ? "Hide Complaint Details"
                      : "View Complaint Details"}
                  </button>

                  {isExpanded && (
                    <div className="my-complaint-details">
                      {complaintImageUrl ? (
                        <div className="my-complaint-evidence">
                          <div className="my-evidence-header">
                            <div>
                              <p className="my-evidence-label">
                                PHOTO EVIDENCE
                              </p>

                              <h4>Uploaded Complaint Image</h4>
                            </div>

                            <a
                              className="my-evidence-open-link"
                              href={complaintImageUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Full Image
                            </a>
                          </div>

                          <div className="my-evidence-image-wrapper">
                            <img
                              className="my-evidence-image"
                              src={complaintImageUrl}
                              alt={`Evidence for ${complaint.title}`}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";

                                const fallback =
                                  event.currentTarget
                                    .nextElementSibling;

                                if (fallback) {
                                  fallback.style.display = "flex";
                                }
                              }}
                            />

                            <div
                              className="my-evidence-fallback"
                              style={{ display: "none" }}
                            >
                              <span>🖼️</span>

                              <div>
                                <h4>Image could not be loaded</h4>

                                <p>
                                  Confirm that the backend uploads
                                  folder is publicly accessible.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="my-no-evidence">
                          <span>📷</span>

                          <div>
                            <h4>No photo evidence</h4>

                            <p>
                              This complaint was submitted without
                              an image attachment.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="my-description-section">
                        <h4>Problem Locality / Area</h4>

                        <p>{problemLocality}</p>
                      </div>

                      <div className="my-description-section">
                        <h4>Complaint Description</h4>

                        <p>{complaint.description}</p>
                      </div>

                      <div className="my-detail-grid">
                        <div>
                          <span>Complaint ID</span>

                          <strong>
                            OCRS-{complaintId}
                          </strong>
                        </div>

                        <div>
                          <span>MongoDB Record ID</span>

                          <strong>{complaint._id}</strong>
                        </div>

                        <div>
                          <span>Priority</span>

                          <strong>
                            {complaintPriority}
                          </strong>
                        </div>

                        <div>
                          <span>Status</span>

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
                          <span>Submitted On</span>

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

export default MyComplaints;