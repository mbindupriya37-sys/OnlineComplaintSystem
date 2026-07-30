import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:8000";

function TrackComplaint() {
  const navigate = useNavigate();

  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateComplaintId = () => {
    const value = complaintId.trim();

    if (!value) {
      return "Please enter a complaint ID.";
    }

    if (value.startsWith("OCRS-")) {
      return "Please enter the 24-character MongoDB Record ID shown in My Complaints.";
    }

    if (value.length !== 24) {
      return "Complaint ID must contain exactly 24 characters.";
    }

    return "";
  };

  const handleTrackComplaint = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setComplaint(null);

    const validationError = validateComplaintId();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.get(
        `${SERVER_URL}/api/complaints/${complaintId.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setComplaint(response.data);
      setMessage("Complaint found successfully.");
      setMessageType("success");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");

        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setMessage(
          "You are not authorized to view this complaint."
        );
      } else if (error.response?.status === 404) {
        setMessage(
          "No complaint was found with this ID."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to retrieve complaint details."
        );
      }

      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "track-status-badge track-status-resolved";
    }

    if (status === "In Progress") {
      return "track-status-badge track-status-progress";
    }

    return "track-status-badge track-status-pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "track-priority-badge track-priority-high";
    }

    if (priority === "Low") {
      return "track-priority-badge track-priority-low";
    }

    return "track-priority-badge track-priority-medium";
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

  const getProblemLocality = (complaintData) => {
    if (
      complaintData?.problemLocality &&
      complaintData.problemLocality.trim()
    ) {
      return complaintData.problemLocality.trim();
    }

    return "Not provided";
  };

  const clearTracking = () => {
    setComplaintId("");
    setComplaint(null);
    setMessage("");
    setMessageType("");
  };

  const complaintImageUrl = complaint
    ? getComplaintImageUrl(complaint.image)
    : "";

  const problemLocality = complaint
    ? getProblemLocality(complaint)
    : "Not provided";

  return (
    <main className="track-complaint-page">
      <section className="track-complaint-header">
        <div>
          <p className="track-complaint-eyebrow">
            COMPLAINT STATUS SERVICE
          </p>

          <h1>Track Your Complaint</h1>

          <p>
            Enter your complaint ID to view its current status,
            priority, problem locality, submission date,
            uploaded evidence, and complete progress.
          </p>
        </div>

        <div className="track-header-actions">
          <Link
            className="track-secondary-link"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="track-primary-link"
            to="/my-complaints"
          >
            My Complaints
          </Link>
        </div>
      </section>

      <section className="track-search-panel">
        <div className="track-search-heading">
          <div>
            <p className="track-panel-label">
              SEARCH COMPLAINT
            </p>

            <h2>Enter Complaint ID</h2>
          </div>

          <button
            className="track-clear-button"
            type="button"
            onClick={clearTracking}
          >
            Clear
          </button>
        </div>

        <form
          className="track-search-form"
          onSubmit={handleTrackComplaint}
        >
          <div className="track-form-group">
            <label htmlFor="complaint-id">
              Complaint ID
            </label>

            <input
              id="complaint-id"
              type="text"
              placeholder="Paste the 24-character complaint ID"
              value={complaintId}
              onChange={(event) =>
                setComplaintId(event.target.value)
              }
              maxLength="24"
            />

            <div className="track-input-meta">
              <span>
                Example: 64a27bbd519e9e0e803bc9d8
              </span>

              <span>{complaintId.length}/24</span>
            </div>
          </div>

          <button
            className="track-submit-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Searching..."
              : "Track Complaint"}
          </button>
        </form>

        <div className="track-help-box">
          <span>?</span>

          <div>
            <h3>
              Where can I find my complaint ID?
            </h3>

            <p>
              Open My Complaints, select View Complaint
              Details, and copy the MongoDB Record ID.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={
              messageType === "success"
                ? "track-message track-message-success"
                : "track-message track-message-error"
            }
          >
            {message}
          </div>
        )}
      </section>

      {complaint && (
        <section className="track-result-panel">
          <div className="track-result-header">
            <div>
              <p className="track-panel-label">
                COMPLAINT RESULT
              </p>

              <h2>{complaint.title}</h2>

              <span className="track-record-id">
                Record ID: {complaint._id}
              </span>
            </div>

            <div className="track-result-badges">
              <span
                className={getPriorityClass(
                  complaint.priority || "Medium"
                )}
              >
                {complaint.priority || "Medium"} Priority
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

          <div className="track-details-grid">
            <div>
              <span>Category</span>

              <strong>{complaint.category}</strong>
            </div>

            <div>
              <span>Problem Locality / Area</span>

              <strong>{problemLocality}</strong>
            </div>

            <div>
              <span>Priority</span>

              <strong>
                {complaint.priority || "Medium"}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong>{complaint.status}</strong>
            </div>

            <div>
              <span>Submitted Date</span>

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

          {complaintImageUrl ? (
            <div className="track-evidence-section">
              <div className="track-evidence-header">
                <div>
                  <p className="track-panel-label">
                    PHOTO EVIDENCE
                  </p>

                  <h3>Uploaded Complaint Image</h3>
                </div>

                <a
                  className="track-evidence-open-link"
                  href={complaintImageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Full Image
                </a>
              </div>

              <div className="track-evidence-image-wrapper">
                <img
                  className="track-evidence-image"
                  src={complaintImageUrl}
                  alt={`Evidence for ${complaint.title}`}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget.nextElementSibling;

                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />

                <div
                  className="track-evidence-fallback"
                  style={{ display: "none" }}
                >
                  <span>🖼️</span>

                  <div>
                    <h4>
                      Image could not be loaded
                    </h4>

                    <p>
                      Check that the backend server is
                      running and the uploads folder is
                      available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="track-no-evidence">
              <span>📷</span>

              <div>
                <h3>No photo evidence</h3>

                <p>
                  This complaint was submitted without an
                  image attachment.
                </p>
              </div>
            </div>
          )}

          <div className="track-description">
            <h3>Problem Locality / Area</h3>

            <p>{problemLocality}</p>
          </div>

          <div className="track-description">
            <h3>Complaint Description</h3>

            <p>{complaint.description}</p>
          </div>

          <div className="track-progress-section">
            <div className="track-progress-heading">
              <p className="track-panel-label">
                STATUS TIMELINE
              </p>

              <h3>Complaint Progress</h3>
            </div>

            <div className="track-progress">
              <div
                className={
                  complaint.status === "Pending" ||
                  complaint.status === "In Progress" ||
                  complaint.status === "Resolved"
                    ? "track-progress-step track-progress-active"
                    : "track-progress-step"
                }
              >
                <span>1</span>

                <div>
                  <h4>Submitted</h4>

                  <p>
                    Your complaint has been registered.
                  </p>
                </div>
              </div>

              <div
                className={
                  complaint.status === "In Progress" ||
                  complaint.status === "Resolved"
                    ? "track-progress-line track-progress-line-active"
                    : "track-progress-line"
                }
              ></div>

              <div
                className={
                  complaint.status === "In Progress" ||
                  complaint.status === "Resolved"
                    ? "track-progress-step track-progress-active"
                    : "track-progress-step"
                }
              >
                <span>2</span>

                <div>
                  <h4>In Progress</h4>

                  <p>
                    The responsible authority is reviewing
                    the issue.
                  </p>
                </div>
              </div>

              <div
                className={
                  complaint.status === "Resolved"
                    ? "track-progress-line track-progress-line-active"
                    : "track-progress-line"
                }
              ></div>

              <div
                className={
                  complaint.status === "Resolved"
                    ? "track-progress-step track-progress-active"
                    : "track-progress-step"
                }
              >
                <span>3</span>

                <div>
                  <h4>Resolved</h4>

                  <p>
                    The complaint has been marked as
                    resolved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default TrackComplaint;