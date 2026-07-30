import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Country } from "country-state-city";

const SERVER_URL = "http://localhost:8000";
const INDIA_COUNTRY_CODE = "IN";

function Register() {
  const navigate = useNavigate();

  const countries = useMemo(() => {
    return Country.getAllCountries().sort((firstCountry, secondCountry) =>
      firstCountry.name.localeCompare(secondCountry.name)
    );
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "India",
    countryCode: INDIA_COUNTRY_CODE,
    state: "",
    district: "",
    mandal: "",
    city: "",
    locality: "",
    address: "",
    pincode: "",
    password: "",
    confirmPassword: ""
  });

  const [postOfficeOptions, setPostOfficeOptions] = useState([]);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [pincodeMessageType, setPincodeMessageType] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearMainMessage = () => {
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const clearPincodeResult = () => {
    setPostOfficeOptions([]);
    setPincodeMessage("");
    setPincodeMessageType("");
  };

  const handleCountryChange = (event) => {
    const selectedCountryCode = event.target.value;

    const selectedCountry = countries.find(
      (country) => country.isoCode === selectedCountryCode
    );

    setFormData((previousData) => ({
      ...previousData,
      country: selectedCountry?.name || "",
      countryCode: selectedCountry?.isoCode || "",
      state: "",
      district: "",
      mandal: "",
      city: "",
      locality: "",
      pincode: ""
    }));

    clearPincodeResult();
    clearMainMessage();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "mobile") {
      updatedValue = value.replace(/[^\d+]/g, "");
    }

    if (name === "pincode") {
      if (formData.countryCode === INDIA_COUNTRY_CODE) {
        updatedValue = value.replace(/\D/g, "").slice(0, 6);
      } else {
        updatedValue = value.slice(0, 12);
      }

      clearPincodeResult();
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: updatedValue
    }));

    clearMainMessage();
  };

  const applyPostOfficeDetails = (postOffice) => {
    if (!postOffice) {
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      country: postOffice.Country || "India",
      countryCode: INDIA_COUNTRY_CODE,
      state: postOffice.State || "",
      district: postOffice.District || "",
      mandal:
        postOffice.Block === "NA" || !postOffice.Block
          ? postOffice.Taluk || ""
          : postOffice.Block,
      city:
        postOffice.Division ||
        postOffice.Region ||
        postOffice.District ||
        "",
      locality: postOffice.Name || ""
    }));
  };

  useEffect(() => {
    if (formData.countryCode !== INDIA_COUNTRY_CODE) {
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      return;
    }

    let requestIsActive = true;

    const lookupPincode = async () => {
      try {
        setIsLookingUpPincode(true);
        setPincodeMessage("Searching for location details...");
        setPincodeMessageType("");

        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${formData.pincode}`
        );

        if (!requestIsActive) {
          return;
        }

        const result = response.data?.[0];
        const postOffices = result?.PostOffice || [];

        if (
          result?.Status !== "Success" ||
          !Array.isArray(postOffices) ||
          postOffices.length === 0
        ) {
          setPostOfficeOptions([]);
          setPincodeMessage(
            "No location was found for this PIN code. Please verify it or enter the address manually."
          );
          setPincodeMessageType("error");
          return;
        }

        setPostOfficeOptions(postOffices);
        applyPostOfficeDetails(postOffices[0]);

        setPincodeMessage(
          postOffices.length > 1
            ? "Location found. Select the correct area or post office below."
            : "Location details filled automatically. Please verify them."
        );
        setPincodeMessageType("success");
      } catch (error) {
        if (!requestIsActive) {
          return;
        }

        setPostOfficeOptions([]);
        setPincodeMessage(
          "Automatic PIN-code lookup is temporarily unavailable. You can enter the location details manually."
        );
        setPincodeMessageType("error");
      } finally {
        if (requestIsActive) {
          setIsLookingUpPincode(false);
        }
      }
    };

    const lookupTimer = setTimeout(lookupPincode, 500);

    return () => {
      requestIsActive = false;
      clearTimeout(lookupTimer);
    };
  }, [formData.pincode, formData.countryCode]);

  const handlePostOfficeChange = (event) => {
    const selectedPostOfficeName = event.target.value;

    const selectedPostOffice = postOfficeOptions.find(
      (postOffice) => postOffice.Name === selectedPostOfficeName
    );

    applyPostOfficeDetails(selectedPostOffice);
    clearMainMessage();
  };

  const validateForm = () => {
    const {
      name,
      email,
      mobile,
      country,
      state,
      district,
      mandal,
      city,
      locality,
      address,
      pincode,
      password,
      confirmPassword
    } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !mobile.trim() ||
      !country.trim() ||
      !state.trim() ||
      !district.trim() ||
      !mandal.trim() ||
      !city.trim() ||
      !locality.trim() ||
      !address.trim() ||
      !pincode.trim() ||
      !password ||
      !confirmPassword
    ) {
      return "Please fill in all required fields.";
    }

    if (name.trim().length < 2) {
      return "Please enter a valid full name.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    const normalizedMobile = mobile.replace(/[^\d]/g, "");

    if (normalizedMobile.length < 7 || normalizedMobile.length > 15) {
      return "Please enter a valid mobile number containing 7 to 15 digits.";
    }

    if (
      formData.countryCode === INDIA_COUNTRY_CODE &&
      !/^\d{6}$/.test(pincode)
    ) {
      return "Please enter a valid 6-digit Indian PIN code.";
    }

    if (
      formData.countryCode !== INDIA_COUNTRY_CODE &&
      (pincode.trim().length < 3 || pincode.trim().length > 12)
    ) {
      return "Please enter a valid postal code.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  };

  const handleRegister = async (event) => {
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
        `${SERVER_URL}/api/auth/register`,
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          country: formData.country.trim(),
          state: formData.state.trim(),
          district: formData.district.trim(),
          mandal: formData.mandal.trim(),
          city: formData.city.trim(),
          locality: formData.locality.trim(),
          address: formData.address.trim(),
          pincode: formData.pincode.trim(),
          password: formData.password
        }
      );

      setMessage(
        response.data.message ||
          "Registration successful. Redirecting to login..."
      );
      setMessageType("success");

      setFormData({
        name: "",
        email: "",
        mobile: "",
        country: "India",
        countryCode: INDIA_COUNTRY_CODE,
        state: "",
        district: "",
        mandal: "",
        city: "",
        locality: "",
        address: "",
        pincode: "",
        password: "",
        confirmPassword: ""
      });

      clearPincodeResult();

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to register. Please confirm that the backend server is running."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-intro">
        <p className="register-eyebrow">ONLINE CITIZEN REGISTRATION</p>

        <h1>Create Your Account</h1>

        <p>
          Register to submit complaints, monitor progress, and receive clear
          status updates from the responsible authorities.
        </p>

        <div className="register-benefits">
          <div>
            <span>✓</span>
            <p>Secure account protected with encrypted passwords</p>
          </div>

          <div>
            <span>✓</span>
            <p>Track all complaints from one personal dashboard</p>
          </div>

          <div>
            <span>✓</span>
            <p>Receive transparent status and priority updates</p>
          </div>
        </div>
      </section>

      <section className="register-card">
        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-header">
            <h2>Citizen Registration Form</h2>
            <p>Fields marked as required must be completed.</p>
          </div>

          <div className="form-section-heading">
            <span>1</span>

            <div>
              <h3>Personal Information</h3>
              <p>Enter your identity and contact details.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="Include country code when required"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="16"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>

              <select
                id="country"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleCountryChange}
                autoComplete="country"
              >
                <option value="">Select your country</option>

                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section-heading">
            <span>2</span>

            <div>
              <h3>Address Information</h3>
              <p>
                Enter your postal code first. Indian location details are
                filled automatically when available.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="pincode">
                {formData.countryCode === INDIA_COUNTRY_CODE
                  ? "PIN Code"
                  : "Postal Code"}
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                placeholder={
                  formData.countryCode === INDIA_COUNTRY_CODE
                    ? "Enter 6-digit PIN code"
                    : "Enter postal code"
                }
                value={formData.pincode}
                onChange={handleChange}
                maxLength={
                  formData.countryCode === INDIA_COUNTRY_CODE ? 6 : 12
                }
                inputMode={
                  formData.countryCode === INDIA_COUNTRY_CODE
                    ? "numeric"
                    : "text"
                }
                autoComplete="postal-code"
              />

              {isLookingUpPincode && (
                <small>Searching for location details...</small>
              )}
            </div>

            {postOfficeOptions.length > 1 && (
              <div className="form-group">
                <label htmlFor="postOffice">Area / Post Office</label>

                <select
                  id="postOffice"
                  value={formData.locality}
                  onChange={handlePostOfficeChange}
                >
                  {postOfficeOptions.map((postOffice, index) => (
                    <option
                      key={`${postOffice.Name}-${postOffice.BranchType}-${index}`}
                      value={postOffice.Name}
                    >
                      {postOffice.Name}
                      {postOffice.BranchType
                        ? ` — ${postOffice.BranchType}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="state">State / Province</label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="Enter state or province"
                value={formData.state}
                onChange={handleChange}
                autoComplete="address-level1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">District / County</label>

              <input
                id="district"
                name="district"
                type="text"
                placeholder="Enter district or county"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="mandal">Mandal / Taluk</label>

              <input
                id="mandal"
                name="mandal"
                type="text"
                placeholder="Enter mandal, taluk or equivalent"
                value={formData.mandal}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City / Village</label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="Enter city or village"
                value={formData.city}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="locality">Area / Locality</label>

              <input
                id="locality"
                name="locality"
                type="text"
                placeholder="Enter area or locality"
                value={formData.locality}
                onChange={handleChange}
                autoComplete="address-level3"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="address">Full Address</label>

              <textarea
                id="address"
                name="address"
                placeholder="House number, street, landmark and complete address"
                value={formData.address}
                onChange={handleChange}
                autoComplete="street-address"
              />
            </div>
          </div>

          {pincodeMessage && (
            <div
              className={
                pincodeMessageType === "success"
                  ? "form-message success-message"
                  : "form-message error-message"
              }
            >
              {pincodeMessage}
            </div>
          )}

          {formData.countryCode !== INDIA_COUNTRY_CODE && (
            <div className="form-message">
              Automatic postal-code lookup is currently enabled for India.
              For other countries, enter the state, district, city and locality
              manually.
            </div>
          )}

          <div className="form-section-heading">
            <span>3</span>

            <div>
              <h3>Account Security</h3>
              <p>Create and confirm a secure password.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className="password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={
                messageType === "success"
                  ? "form-message success-message"
                  : "form-message error-message"
              }
            >
              {message}
            </div>
          )}

          <button
            className="register-submit-btn"
            type="submit"
            disabled={isSubmitting || isLookingUpPincode}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <p className="account-switch-text">
            Already have an account?{" "}
            <Link to="/login">Login to your account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;