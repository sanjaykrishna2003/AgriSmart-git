import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaLeaf } from "react-icons/fa";
import bgVideo from "../assets/greenwhitevideo.mp4";

// Redux actions
import { setUser, setToken, setDemoMode, setApiOnline, setFarms, setCrops } from "../main";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.agri.user);

  React.useEffect(() => {
    if (user) {
      navigate(user.role === "OFFICER" ? "/officer/dashboard" : "/dashboard");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "farmer@agrismart.com",
    password: "password",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Try real backend login
      const res = await fetch("http://localhost:8081/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch(setToken(data.token));
        dispatch(setUser(data.user));
        dispatch(setApiOnline(true));
        dispatch(setDemoMode(false));
        
        // Redirect based on role
        if (data.user.role === "OFFICER") {
          navigate("/officer/dashboard");
        } else {
          navigate("/dashboard");
        }
        return;
      } else {
        const err = await res.json();
        toast.error(err.message || "Invalid credentials.");
      }
    } catch (err) {
      console.warn("User service offline. Validating mock credentials.", err);

      // 2. Fallback to Demo/Mock Mode validations
      const email = formData.email;
      const password = formData.password;

      // Check registered demo users first
      let registeredDemoUser = null;
      try {
        const savedUsersStr = localStorage.getItem('demo_users');
        if (savedUsersStr) {
          const list = JSON.parse(savedUsersStr);
          registeredDemoUser = list.find(u => (u.email === email || u.phone === email) && u.password === password);
        }
      } catch (e) {}

      const defaultFarms = [
        { farmId: 1, farmName: "Green Valley Farm", location: "Coimbatore", area: 4.0, soilType: "Black Soil", waterSource: "Borewell", latitude: 11.0168, longitude: 76.9558 },
        { farmId: 2, farmName: "South Farm", location: "Pollachi", area: 2.0, soilType: "Red Soil", waterSource: "Canal", latitude: 10.659, longitude: 77.008 }
      ];
      const defaultCrops = [
        { cropId: 1, cropName: "Rice", farmId: 1, plantedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], duration: 120, status: "ACTIVE", expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: "Paddy crop growing healthy." },
        { cropId: 2, cropName: "Cotton", farmId: 2, plantedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], duration: 150, status: "ACTIVE", expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: "Vegetative stage progress." }
      ];

      const savedFarmsStr = localStorage.getItem('demo_farms');
      const savedCropsStr = localStorage.getItem('demo_crops');

      if (registeredDemoUser) {
        dispatch(setToken(`mock-jwt-token-${registeredDemoUser.role.toLowerCase()}`));
        dispatch(setDemoMode(true));
        dispatch(setApiOnline(false));
        dispatch(setUser(registeredDemoUser));
        localStorage.setItem('demo_user_profile', JSON.stringify(registeredDemoUser));

        dispatch(setFarms(savedFarmsStr ? JSON.parse(savedFarmsStr) : defaultFarms));
        dispatch(setCrops(savedCropsStr ? JSON.parse(savedCropsStr) : defaultCrops));

        if (registeredDemoUser.role === "OFFICER" || registeredDemoUser.role === "ADMIN") {
          navigate("/officer/dashboard");
        } else {
          navigate("/dashboard");
        }
        return;
      }

      if ((email === "farmer@agrismart.com" || email === "9876543210") && password === "password") {
        dispatch(setToken("mock-jwt-token-farmer"));
        dispatch(setDemoMode(true));
        dispatch(setApiOnline(false));

        const mockUser = {
          userId: 101,
          name: "Siddharth",
          email: "farmer@agrismart.com",
          phone: "9876543210",
          role: "FARMER",
          district: "Coimbatore",
          state: "Tamil Nadu",
          createdAt: "2026-01-10T10:30:00",
        };
        dispatch(setUser(mockUser));
        localStorage.setItem('demo_user_profile', JSON.stringify(mockUser));
        dispatch(setFarms(savedFarmsStr ? JSON.parse(savedFarmsStr) : defaultFarms));
        dispatch(setCrops(savedCropsStr ? JSON.parse(savedCropsStr) : defaultCrops));

        navigate("/dashboard");
      } else if (email === "officer@agrismart.com" && password === "password") {
        dispatch(setToken("mock-jwt-token-officer"));
        dispatch(setDemoMode(true));
        dispatch(setApiOnline(false));

        dispatch(setUser({
          userId: 102,
          name: "Officer Priya",
          email: "officer@agrismart.com",
          phone: "9777766666",
          role: "OFFICER",
          district: "Ambala",
          state: "Haryana",
          createdAt: new Date().toISOString(),
        }));

        navigate("/officer/dashboard");
      } else if (email === "admin@agrismart.com" && password === "password") {
        dispatch(setToken("mock-jwt-token-admin"));
        dispatch(setDemoMode(true));
        dispatch(setApiOnline(false));

        dispatch(setUser({
          userId: 1,
          name: "Siddharth Sharma",
          email: "admin@agrismart.com",
          phone: "9999988888",
          role: "ADMIN",
          district: "Chandigarh",
          state: "Punjab",
          createdAt: new Date().toISOString(),
        }));

        navigate("/officer/dashboard");
      } else {
        toast.error("Invalid email or password.");
      }
    }
  };

  return (
    <div className="login-page">
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="background-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="overlay"></div>

      {/* Login Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="logo-section">
          <FaLeaf className="leaf-icon" />
          <h1>AgriSmart</h1>
          <p>Smart Farming Begins Here</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input
              type="text"
              placeholder="Email or Mobile"
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

          {/* Remember */}
          <div className="login-options">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button className="login-btn" type="submit">
            Login
          </button>

          {/* Register */}
          <div className="register-text">
            Don't have an account?
            <Link to="/register">Register</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;