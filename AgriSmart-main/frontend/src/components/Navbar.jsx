import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../main";
import "./components.css";

import {
    FaLeaf,
    FaHome,
    FaTachometerAlt,
    FaSeedling,
    FaCloudSun,
    FaUserCircle,
    FaSignInAlt,
    FaSignOutAlt,
    FaRobot
} from "react-icons/fa";

import { GiPlantRoots } from "react-icons/gi";

const Navbar = ({ transparent = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.agri.user);
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        if (!transparent) return;

        const handleScroll = () => {
            const heroHeight = window.innerHeight - 80;
            setScroll(window.scrollY >= heroHeight);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [transparent]);

    const handleLogoutClick = (e) => {
        e.preventDefault();
        dispatch(logout());
        navigate("/");
    };

    const navbarClass = transparent
        ? (scroll ? "homeNavbar scrolled" : "homeNavbar")
        : "homeNavbar scrolled";

    return (
        <nav className={navbarClass}>
            <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                <FaLeaf className="logoIcon" />
                <span>AgriSmart</span>
            </div>

            <ul className="navLinks">
                <li>
                    <Link to="/">
                        <FaHome />
                        Home
                    </Link>
                </li>

                {user && user.role === "FARMER" && (
                    <>
                        <li>
                            <Link to="/dashboard">
                                <FaTachometerAlt />
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/crops">
                                <GiPlantRoots />
                                Crop Records
                            </Link>
                        </li>

                        <li>
                            <Link to="/schemes">
                                <FaSeedling />
                                Schemes
                            </Link>
                        </li>

                        <li>
                            <Link to="/weather">
                                <FaCloudSun />
                                Weather
                            </Link>
                        </li>

                        <li>
                            <Link to="/chatbot">
                                <FaRobot />
                                AI Chatbot
                            </Link>
                        </li>

                        <li>
                            <Link to="/profile">
                                <FaUserCircle />
                                Profile
                            </Link>
                        </li>
                    </>
                )}

                {user && user.role === "OFFICER" && (
                    <li>
                        <Link to="/officer/dashboard">
                            <FaTachometerAlt />
                            Officer Dashboard
                        </Link>
                    </li>
                )}

                {user && user.role === "ADMIN" && (
                    <li>
                        <Link to="/admin">
                            <FaTachometerAlt />
                            Admin Dashboard
                        </Link>
                    </li>
                )}

                {user ? (
                    <li className="logoutBtn">
                        <a href="#" onClick={handleLogoutClick}>
                            <FaSignOutAlt />
                            Logout
                        </a>
                    </li>
                ) : (
                    <li className="loginBtn">
                        <Link to="/login">
                            <FaSignInAlt />
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;