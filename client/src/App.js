import "./App.css";
import "./styles/Login.css";
import "./styles/Dashboard.css";
import "./styles/CreateComplaint.css";
import "./styles/MyComplaints.css";
import "./styles/AdminDashboard.css";
import "./styles/TrackComplaint.css";
import "./styles/Profile.css";
import "./styles/Contact.css";
import "./styles/About.css";
import "./styles/Footer.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateComplaint from "./pages/CreateComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import TrackComplaint from "./pages/TrackComplaint";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/register" element={<Register />} />

            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/create-complaint"
              element={<CreateComplaint />}
            />

            <Route
              path="/my-complaints"
              element={<MyComplaints />}
            />

            <Route
              path="/track"
              element={<TrackComplaint />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;