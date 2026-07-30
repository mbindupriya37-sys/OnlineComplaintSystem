import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page">
      <section className="about-header">
        <p className="about-eyebrow">
          ABOUT THE PLATFORM
        </p>

        <h1>Smart Complaint Management System</h1>

        <p>
          A digital platform that helps citizens register,
          track, and manage public-service complaints in a
          clear and transparent way.
        </p>
      </section>

      <section className="about-introduction">
        <div>
          <p className="about-section-label">
            OUR PURPOSE
          </p>

          <h2>
            Making complaint resolution simpler and more
            transparent
          </h2>

          <p>
            The Smart Complaint Management System allows users
            to submit complaints, attach photo evidence, track
            progress, and view status updates from one secure
            account.
          </p>

          <p>
            Administrators can review complaints, inspect
            evidence, change complaint status, and manage
            records through a dedicated dashboard.
          </p>
        </div>

        <div className="about-highlight-card">
          <span>🏛️</span>

          <h3>Citizen-focused service</h3>

          <p>
            The platform is designed to improve communication
            between citizens and responsible authorities.
          </p>
        </div>
      </section>

      <section className="about-features">
        <div className="about-section-heading">
          <p className="about-section-label">
            MAIN FEATURES
          </p>

          <h2>What the system provides</h2>
        </div>

        <div className="about-feature-grid">
          <article className="about-feature-card">
            <span>📝</span>
            <h3>Online Complaint Submission</h3>
            <p>
              Users can register complaints with category,
              priority, description, and photo evidence.
            </p>
          </article>

          <article className="about-feature-card">
            <span>🔎</span>
            <h3>Complaint Tracking</h3>
            <p>
              Every complaint can be tracked using its unique
              MongoDB record ID.
            </p>
          </article>

          <article className="about-feature-card">
            <span>📷</span>
            <h3>Photo Evidence</h3>
            <p>
              Images can be uploaded to help administrators
              understand reported issues.
            </p>
          </article>

          <article className="about-feature-card">
            <span>📊</span>
            <h3>Admin Dashboard</h3>
            <p>
              Administrators can search, filter, update, and
              delete complaint records.
            </p>
          </article>

          <article className="about-feature-card">
            <span>🔐</span>
            <h3>Secure Authentication</h3>
            <p>
              JWT authentication and role-based authorization
              protect user and administrator functions.
            </p>
          </article>

          <article className="about-feature-card">
            <span>👤</span>
            <h3>Profile Management</h3>
            <p>
              Users can review and update their personal,
              address, and password information.
            </p>
          </article>
        </div>
      </section>

      <section className="about-technology">
        <div>
          <p className="about-section-label">
            TECHNOLOGY
          </p>

          <h2>Built using the MERN stack</h2>

          <p>
            The application uses MongoDB, Express.js, React,
            and Node.js, along with JWT, Axios, Multer, and
            responsive CSS.
          </p>
        </div>

        <div className="about-tech-list">
          <span>MongoDB</span>
          <span>Express.js</span>
          <span>React</span>
          <span>Node.js</span>
          <span>JWT</span>
          <span>Multer</span>
        </div>
      </section>

      <section className="about-actions">
        <h2>Ready to register a complaint?</h2>

        <p>
          Create an account or sign in to access the complaint
          services.
        </p>

        <div>
          <Link
            className="about-secondary-link"
            to="/register"
          >
            Create Account
          </Link>

          <Link
            className="about-primary-link"
            to="/login"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;