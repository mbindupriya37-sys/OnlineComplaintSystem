import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const categoryOptions = [
  "Water Supply",
  "Electricity",
  "Roads and Potholes",
  "Drainage",
  "Sanitation",
  "Street Lights",
  "Public Transport",
  "Health Services",
  "Education",
  "Public Safety",
  "Other"
];

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
];

const maximumImageSize = 5 * 1024 * 1024;

function CreateComplaint() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "Medium",
    problemLocality: "",
    description: ""
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const clearMessage = () => {
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    clearMessage();
  };

  const clearSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    clearMessage();

    if (!file) {
      clearSelectedImage();
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      clearSelectedImage();
      setMessage("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      setMessageType("error");
      return;
    }

    if (file.size > maximumImageSize) {
      clearSelectedImage();
      setMessage("The selected image must be 5 MB or smaller.");
      setMessageType("error");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const {
      title,
      category,
      priority,
      problemLocality,
      description
    } = formData;

    if (!title.trim()) {
      return "Please enter a complaint title.";
    }

    if (title.trim().length < 5) {
      return "Complaint title must contain at least 5 characters.";
    }

    if (!category) {
      return "Please select a complaint category.";
    }

    if (!priority) {
      return "Please select a complaint priority.";
    }

    if (!problemLocality.trim()) {
      return "Please enter the problem locality or area.";
    }

    if (problemLocality.trim().length < 3) {
      return "Problem locality must contain at least 3 characters.";
    }

    if (!description.trim()) {
      return "Please enter a detailed complaint description.";
    }

    if (description.trim().length < 15) {
      return "Complaint description must contain at least 15 characters.";
    }

    return "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      priority: "Medium",
      problemLocality: "",
      description: ""
    });

    clearSelectedImage();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError = validateForm();

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

    const complaintData = new FormData();

    complaintData.append("title", formData.title.trim());
    complaintData.append("description", formData.description.trim());
    complaintData.append("category", formData.category);
    complaintData.append("priority", formData.priority);
    complaintData.append(
      "problemLocality",
      formData.problemLocality.trim()
    );

    if (selectedImage) {
      complaintData.append("image", selectedImage);
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        "http://localhost:8000/api/complaints/create",
        complaintData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message || "Complaint created successfully."
      );
      setMessageType("success");

      resetForm();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");

        navigate("/login");
        return;
      }

      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage(
          "Unable to submit the complaint. Please verify that the backend server is running."
        );
      }

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetForm();
    setMessage("");
    setMessageType("");
  };

  const getPriorityDescription = () => {
    if (formData.priority === "High") {
      return "Urgent issue that may affect safety or essential public services.";
    }

    if (formData.priority === "Low") {
      return "General issue that does not require immediate action.";
    }

    return "Important issue requiring attention within a reasonable time.";
  };

  const formatImageSize = (sizeInBytes) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);

    return `${sizeInMegabytes.toFixed(2)} MB`;
  };

  return (
    <main className="create-complaint-page">
      <section className="complaint-introduction">
        <p className="complaint-eyebrow">CITIZEN COMPLAINT SERVICE</p>

        <h1>Register a New Complaint</h1>

        <p>
          Provide complete and accurate information so the responsible
          authority can understand, review, and resolve your issue efficiently.
        </p>

        <div className="complaint-guidelines">
          <div>
            <span>1</span>

            <div>
              <h3>Use a clear title</h3>
              <p>Briefly describe the main issue you are reporting.</p>
            </div>
          </div>

          <div>
            <span>2</span>

            <div>
              <h3>Enter the exact problem area</h3>
              <p>
                Mention the locality, colony, street, landmark, or nearby place
                where the problem exists.
              </p>
            </div>
          </div>

          <div>
            <span>3</span>

            <div>
              <h3>Add useful evidence</h3>
              <p>
                Attach a clear image when it helps authorities understand the
                issue.
              </p>
            </div>
          </div>
        </div>

        <div className="complaint-privacy-note">
          <strong>Your information is protected</strong>

          <p>
            Complaint details and uploaded evidence are available only to you
            and the authorized administrative team.
          </p>
        </div>
      </section>

      <section className="complaint-form-container">
        <form
          className="create-complaint-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="complaint-form-header">
            <div>
              <p>COMPLAINT DETAILS</p>
              <h2>Tell us about the issue</h2>
            </div>

            <Link to="/dashboard">← Dashboard</Link>
          </div>

          <div className="complaint-form-section">
            <div className="complaint-section-heading">
              <span>1</span>

              <div>
                <h3>Basic Information</h3>
                <p>Enter a title and select the related service category.</p>
              </div>
            </div>

            <div className="complaint-form-grid">
              <div className="complaint-form-group complaint-full-width">
                <label htmlFor="title">Complaint Title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Example: Street light not working near my house"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength="100"
                />

                <div className="complaint-field-meta">
                  <span>Use a short and clear title</span>
                  <span>{formData.title.length}/100</span>
                </div>
              </div>

              <div className="complaint-form-group">
                <label htmlFor="category">Complaint Category</label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>

                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="complaint-form-group">
                <label htmlFor="priority">Priority Level</label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            <div
              className={`priority-information priority-${formData.priority.toLowerCase()}`}
            >
              <span>
                {formData.priority === "High"
                  ? "!"
                  : formData.priority === "Low"
                    ? "↓"
                    : "•"}
              </span>

              <div>
                <strong>{formData.priority} Priority</strong>
                <p>{getPriorityDescription()}</p>
              </div>
            </div>
          </div>

          <div className="complaint-form-section">
            <div className="complaint-section-heading">
              <span>2</span>

              <div>
                <h3>Problem Location</h3>
                <p>
                  Enter the current locality or exact area where the problem
                  exists.
                </p>
              </div>
            </div>

            <div className="complaint-form-group">
              <label htmlFor="problemLocality">
                Problem Locality / Area
              </label>

              <input
                id="problemLocality"
                name="problemLocality"
                type="text"
                placeholder="Example: Habsiguda, Street No. 8, near Metro Station"
                value={formData.problemLocality}
                onChange={handleChange}
                maxLength="200"
                autoComplete="street-address"
              />

              <div className="complaint-field-meta">
                <span>
                  Enter the colony, locality, street, landmark, or nearby place
                </span>
                <span>{formData.problemLocality.length}/200</span>
              </div>
            </div>
          </div>

          <div className="complaint-form-section">
            <div className="complaint-section-heading">
              <span>3</span>

              <div>
                <h3>Detailed Description</h3>
                <p>
                  Explain what happened, how long the issue has existed, and how
                  it affects you or the public.
                </p>
              </div>
            </div>

            <div className="complaint-form-group">
              <label htmlFor="description">Complaint Description</label>

              <textarea
                id="description"
                name="description"
                placeholder="Describe the issue clearly. Include when you noticed it, how serious it is, and any other important information."
                value={formData.description}
                onChange={handleChange}
                maxLength="1000"
              />

              <div className="complaint-field-meta">
                <span>Minimum 15 characters</span>
                <span>{formData.description.length}/1000</span>
              </div>
            </div>
          </div>

          <div className="complaint-form-section">
            <div className="complaint-section-heading">
              <span>4</span>

              <div>
                <h3>Photo Evidence</h3>
                <p>
                  Upload an optional image showing the reported issue clearly.
                </p>
              </div>
            </div>

            <div className="complaint-image-upload">
              <label
                className="complaint-upload-area"
                htmlFor="complaint-image"
              >
                <input
                  ref={fileInputRef}
                  id="complaint-image"
                  name="image"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                <span className="complaint-upload-icon">📷</span>

                <strong>
                  {selectedImage
                    ? "Choose a different image"
                    : "Choose complaint evidence"}
                </strong>

                <p>JPG, JPEG, PNG or WEBP — maximum size 5 MB</p>
              </label>

              {selectedImage && imagePreview && (
                <div className="complaint-image-preview-card">
                  <div className="complaint-preview-image-wrapper">
                    <img
                      src={imagePreview}
                      alt="Selected complaint evidence preview"
                    />
                  </div>

                  <div className="complaint-preview-information">
                    <div>
                      <h4>{selectedImage.name}</h4>
                      <p>{formatImageSize(selectedImage.size)}</p>
                    </div>

                    <button
                      className="complaint-remove-image-button"
                      type="button"
                      onClick={clearSelectedImage}
                      disabled={isSubmitting}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="complaint-review-box">
            <h3>Before submitting</h3>

            <div>
              <span>✓</span>
              <p>I have selected the correct complaint category.</p>
            </div>

            <div>
              <span>✓</span>
              <p>
                I have entered the correct locality or area where the problem
                exists.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>The complaint description contains accurate information.</p>
            </div>

            <div>
              <span>✓</span>
              <p>
                The uploaded image, when provided, relates directly to this
                complaint.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>I understand that false complaints may be rejected.</p>
            </div>
          </div>

          {message && (
            <div
              className={
                messageType === "success"
                  ? "complaint-message complaint-message-success"
                  : "complaint-message complaint-message-error"
              }
            >
              {message}
            </div>
          )}

          <div className="complaint-form-actions">
            <button
              className="complaint-reset-button"
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Clear Form
            </button>

            <button
              className="complaint-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Complaint..." : "Submit Complaint"}
            </button>
          </div>

          <p className="complaint-form-footer">
            After submission, you can monitor the complaint from the{" "}
            <Link to="/my-complaints">My Complaints</Link> page.
          </p>
        </form>
      </section>
    </main>
  );
}

export default CreateComplaint;