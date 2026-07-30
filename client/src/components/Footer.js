import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>🏛 Smart Complaint</h2>

          <p>
            A secure digital platform for registering,
            tracking, and managing public-service complaints.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/track">Track Complaint</Link>
        </div>

        <div className="footer-links">
          <h3>Citizen Services</h3>

          <Link to="/register">Create Account</Link>
          <Link to="/login">Login</Link>
          <Link to="/create-complaint">
            New Complaint
          </Link>
          <Link to="/my-complaints">
            My Complaints
          </Link>
        </div>

        <div className="footer-contact">
          <h3>Support</h3>

          <p>📧 support@smartcomplaint.com</p>
          <p>📞 +91 98765 43210</p>
          <p>🕒 Monday–Saturday, 9 AM–6 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Smart Complaint
          Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;