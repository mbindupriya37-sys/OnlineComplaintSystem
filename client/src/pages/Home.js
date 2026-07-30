import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-text">
          <p className="hero-label">SMART COMPLAINT PORTAL</p>

          <h1>
            Smart Online Complaint
            <span> Management System</span>
          </h1>

          <h2>Your Voice. Our Responsibility.</h2>

          <p className="hero-description">
            Register complaints, track their progress, and receive transparent
            updates from the responsible authorities.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="hero-btn primary">
              Register Complaint
            </Link>

            <Link to="/my-complaints" className="hero-btn secondary">
              Track Complaint
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="illustration-card">
            <div className="clipboard">
              <div className="clip"></div>

              <div className="check-row">
                <span>✓</span>
                <div></div>
              </div>

              <div className="check-row">
                <span>✓</span>
                <div></div>
              </div>

              <div className="check-row">
                <span>✓</span>
                <div></div>
              </div>
            </div>

            <div className="shield">✓</div>
          </div>
        </div>
      </section>

      <section className="actions-section">
        <div className="section-heading">
          <p>WHAT YOU CAN DO</p>
          <h2>Simple, Secure and Transparent</h2>
        </div>

        <div className="action-grid">
          <div className="action-card">
            <div className="action-icon blue">＋</div>
            <h3>Register Complaint</h3>
            <p>
              Submit complaints quickly with category, priority and detailed
              information.
            </p>
            <Link to="/create-complaint">Get Started →</Link>
          </div>

          <div className="action-card">
            <div className="action-icon green">⌕</div>
            <h3>Track Complaint Status</h3>
            <p>
              Check whether your complaint is pending, in progress or resolved.
            </p>
            <Link to="/my-complaints">Track Now →</Link>
          </div>

          <div className="action-card">
            <div className="action-icon purple">⚙</div>
            <h3>Admin Resolution</h3>
            <p>
              Admin can review, update and resolve complaints efficiently.
            </p>
            <Link to="/admin">Admin Login →</Link>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">🛡</div>
          <div>
            <h4>Transparent Process</h4>
            <p>Real-time updates at every stage of your complaint.</p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">🔒</div>
          <div>
            <h4>Secure & Confidential</h4>
            <p>Your personal information remains protected.</p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">◷</div>
          <div>
            <h4>Timely Resolution</h4>
            <p>Complaints are reviewed and resolved efficiently.</p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">👥</div>
          <div>
            <h4>Accountable Authorities</h4>
            <p>Complaints reach the appropriate responsible team.</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>
          © 2026 Smart Complaint Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;