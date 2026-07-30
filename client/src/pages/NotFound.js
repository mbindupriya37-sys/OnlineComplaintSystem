import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f8fc",
        padding: "40px"
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          textAlign: "center",
          background: "#ffffff",
          padding: "50px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <h1
          style={{
            fontSize: "80px",
            color: "#1769c2",
            marginBottom: "10px"
          }}
        >
          404
        </h1>

        <h2
          style={{
            color: "#173b63",
            marginBottom: "15px"
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
            marginBottom: "30px"
          }}
        >
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          style={{
            background: "#1769c2",
            color: "#fff",
            padding: "12px 25px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;