import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SERVER_URL = "http://localhost:8000";

function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    district: "",
    mandal: "",
    city: "",
    locality: "",
    address: "",
    pincode: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setMessage("");
        setMessageType("");

        const response = await axios.get(
          `${SERVER_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const user = response.data.user;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          country: user.country || "",
          state: user.state || "",
          district: user.district || "",
          mandal: user.mandal || "",
          city: user.city || "",
          locality: user.locality || "",
          address: user.address || "",
          pincode: user.pincode || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
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
            "Unable to load your profile."
        );
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const validateForm = () => {
    const requiredFields = [
      ["name", "Name"],
      ["email", "Email"],
      ["mobile", "Mobile number"],
      ["country", "Country"],
      ["state", "State"],
      ["district", "District"],
      ["mandal", "Mandal"],
      ["city", "City"],
      ["locality", "Locality"],
      ["address", "Address"],
      ["pincode", "Pincode"]
    ];

    for (const [fieldName, label] of requiredFields) {
      if (!formData[fieldName].trim()) {
        return `${label} is required.`;
      }
    }

    if (
      formData.newPassword &&
      !formData.currentPassword
    ) {
      return "Enter your current password before setting a new password.";
    }

    if (
      formData.newPassword &&
      formData.newPassword.length < 6
    ) {
      return "New password must contain at least 6 characters.";
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      return "New password and confirmation do not match.";
    }

    return "";
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

    try {
      setIsSaving(true);

      const response = await axios.put(
        `${SERVER_URL}/api/auth/profile`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          country: formData.country.trim(),
          state: formData.state.trim(),
          district: formData.district.trim(),
          mandal: formData.mandal.trim(),
          city: formData.city.trim(),
          locality: formData.locality.trim(),
          address: formData.address.trim(),
          pincode: formData.pincode.trim(),
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setFormData((previousData) => ({
        ...previousData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );
      setMessageType("success");
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
          "Unable to update your profile."
      );
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <div className="profile-loading-card">
          <div className="profile-loader"></div>

          <h2>Loading your profile...</h2>

          <p>
            Please wait while we retrieve your account
            information.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-header">
        <div>
          <p className="profile-eyebrow">
            ACCOUNT MANAGEMENT
          </p>

          <h1>My Profile</h1>

          <p>
            Review and update your personal details, contact
            information, address, and account password.
          </p>
        </div>

        <div className="profile-header-actions">
          <Link
            className="profile-secondary-link"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className="profile-primary-link"
            to="/my-complaints"
          >
            My Complaints
          </Link>
        </div>
      </section>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >        <section className="profile-form-section">
          <div className="profile-section-heading">
            <span>1</span>

            <div>
              <h2>Personal Information</h2>

              <p>
                Update your name, email address, and mobile
                number.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="mobile">
                Mobile Number
              </label>

              <input
                id="mobile"
                name="mobile"
                type="text"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="profile-form-section">
          <div className="profile-section-heading">
            <span>2</span>

            <div>
              <h2>Address Information</h2>

              <p>
                Keep your location details accurate for
                complaint records.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="country">
                Country
              </label>

              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="district">
                District
              </label>

              <input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="mandal">
                Mandal
              </label>

              <input
                id="mandal"
                name="mandal"
                type="text"
                value={formData.mandal}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="locality">
                Locality
              </label>

              <input
                id="locality"
                name="locality"
                type="text"
                value={formData.locality}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group profile-full-width">
              <label htmlFor="address">
                Complete Address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="pincode">
                Pincode
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
                <section className="profile-form-section">
          <div className="profile-section-heading">
            <span>3</span>

            <div>
              <h2>Change Password</h2>

              <p>
                Leave these fields blank if you do not want to
                change your password.
              </p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>
        </section>

        {message && (
          <div
            className={
              messageType === "success"
                ? "profile-message profile-message-success"
                : "profile-message profile-message-error"
            }
          >
            {message}
          </div>
        )}

        <div className="profile-form-actions">
          <Link
            className="profile-cancel-link"
            to="/dashboard"
          >
            Cancel
          </Link>

          <button
            className="profile-save-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving Changes..."
              : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default Profile;