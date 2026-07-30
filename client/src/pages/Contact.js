import React, { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    if (statusMessage) {
      setStatusMessage("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setStatusMessage("Please complete all contact form fields.");
      return;
    }

    setStatusMessage(
      "Your message has been recorded successfully."
    );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <main className="contact-page">
      <section className="contact-header">
        <p className="contact-eyebrow">
          SUPPORT AND ASSISTANCE
        </p>

        <h1>Contact Us</h1>

        <p>
          Reach out for help with registration, complaint
          submission, tracking, or account-related issues.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-information">
          <article className="contact-info-card">
            <span>📧</span>

            <div>
              <h3>Email Support</h3>
              <p>support@smartcomplaint.com</p>
            </div>
          </article>

          <article className="contact-info-card">
            <span>📞</span>

            <div>
              <h3>Phone Support</h3>
              <p>+91 98765 43210</p>
            </div>
          </article>

          <article className="contact-info-card">
            <span>📍</span>

            <div>
              <h3>Office Address</h3>
              <p>
                Citizen Service Centre, Main Road,
                Hyderabad, Telangana
              </p>
            </div>
          </article>

          <article className="contact-info-card">
            <span>🕒</span>

            <div>
              <h3>Working Hours</h3>
              <p>Monday to Saturday, 9:00 AM to 6:00 PM</p>
            </div>
          </article>
        </div>

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <div className="contact-form-heading">
            <h2>Send a Message</h2>

            <p>
              Fill in the form and our support team will review
              your request.
            </p>
          </div>

          <div className="contact-form-group">
            <label htmlFor="contact-name">
              Full Name
            </label>

            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="contact-form-group">
            <label htmlFor="contact-email">
              Email Address
            </label>

            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="contact-form-group">
            <label htmlFor="contact-subject">
              Subject
            </label>

            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="contact-form-group">
            <label htmlFor="contact-message">
              Message
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          {statusMessage && (
            <div className="contact-message">
              {statusMessage}
            </div>
          )}

          <button
            className="contact-submit-button"
            type="submit"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}

export default Contact;