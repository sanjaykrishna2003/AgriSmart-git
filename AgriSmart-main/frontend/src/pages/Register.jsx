import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaMapMarkerAlt,
} from "react-icons/fa";
import bgVideo from "../assets/greenwhitevideo.mp4";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.agri.user);

  useEffect(() => {
    if (user) {
      navigate(user.role === "OFFICER" ? "/officer/dashboard" : "/dashboard");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    state: "",
    district: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Map role string to backend enum format
    let mappedRole = "FARMER";
    if (formData.role === "Agriculture Officer") {
      mappedRole = "OFFICER";
    } else if (formData.role === "Admin") {
      mappedRole = "ADMIN";
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.mobile,
      role: mappedRole,
      district: formData.district,
      state: formData.state
    };

    try {
      const res = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Registration Successful! Please log in.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        return;
      } else {
        const err = await res.json();
        let errMsg = "Registration failed. Try again.";
        if (err.message) {
          errMsg = err.message;
        } else if (err && typeof err === "object") {
          errMsg = Object.values(err).join(", ");
        }
        toast.error(errMsg);
        return;
      }
    } catch (err) {
      console.warn("Backend offline. Simulating registration.", err);
    }

    // Demo Mode Persistence
    const demoUser = {
      userId: Date.now(),
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.mobile,
      role: mappedRole,
      district: formData.district,
      state: formData.state,
      createdAt: new Date().toISOString()
    };
    try {
      const existingStr = localStorage.getItem('demo_users');
      const list = existingStr ? JSON.parse(existingStr) : [];
      list.push(demoUser);
      localStorage.setItem('demo_users', JSON.stringify(list));
    } catch (e) {}

    toast.success("Registration Simulated successfully (Demo Mode)! You can now log in.");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="login-page">
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="overlay"></div>

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="logo-section">
          <FaLeaf className="leaf-icon" />
          <h1>Create Account</h1>
          <p>Join AgriSmart Today</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="register-grid">
            {/* Full Name */}
            <div className="input-box">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mobile */}
            <div className="input-box">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                placeholder="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                required
              />
            </div>

            {/* Email */}
            <div className="input-box">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="input-box">
              <FaLock className="input-icon" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Role */}
            <div className="input-box">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Platform Role</option>
                <option value="Farmer">Farmer</option>
                <option value="Agriculture Officer">Agriculture Officer</option>
              </select>
            </div>

            {/* State */}
            <div className="input-box">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                placeholder="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            {/* District */}
            <div className="input-box">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                placeholder="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button className="login-btn" type="submit">
            Register
          </button>

          <div className="register-text">
            Already have an account?
            <Link to="/login">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Register;