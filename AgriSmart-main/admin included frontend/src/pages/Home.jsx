import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/sankari.css";
import heroImage from "../assets/hero.png";
import farmBg from "../assets/farmbg.png";
import crop from "../assets/home/crophome.jpg";
import maize from "../assets/home/maize.jpg";
import rice from "../assets/home/rice.jpg";
import groundnut from "../assets/home/groundnut.jpg";
import tomato from "../assets/home/tomato.jpg";

import weatherHome1 from "../assets/home/weatherhome1.jpg";
import weatherHome2 from "../assets/home/weatherhome2.jpg";
import schemes from "../assets/home/schemes.jpg";
import robot from "../assets/home/robot.jpg";
import graph from "../assets/home/graphanalytics.jpg";
import region from "../assets/home/regionhome.jpg";


import { FaLeaf, FaHome, FaTachometerAlt, FaSeedling, FaCloudSun, FaUserCircle, FaSignInAlt, FaRobot, FaBullhorn } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const user = useSelector((state) => state.agri.user);
  const getStartedPath = user ? (user.role === 'OFFICER' ? '/officer/dashboard' : '/dashboard') : '/login';
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight - 80; // Hero section height

      if (window.scrollY >= heroHeight) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="sankari-layout">
      <Navbar transparent />

      {/* ================= HERO ================= */}

    <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="overlay">
            <div className="heroContent">

                <h1 style={{color: "#b6b6b6ff"}}>Smart Agriculture for a Smarter Future</h1>
                <p style={{color: "#838383ff"}}> Empowering farmers with AI, Weather Intelligence, Government Schemes and Crop Management. </p>
                
                <Link to={getStartedPath}>
                <button className="heroButton"> Get Started </button>
                </Link>

            </div>
        </div>
    </section>

      {/* ================= EXPLORE ================= */}

    <section className="explore" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)), url(${farmBg})` }}>
        <div className="exploreOverlay">
            <h2>Explore AgriSmart Capabilities</h2>
            <p> Unlock premium agricultural services designed to maximize crop yield efficiency and simplify daily farm administration. </p>
            <div className="features">

                            {/* ================= Crop Recommendation ================= */}

                <div className="cropDashboard">

                    {/* LEFT */}
                    <div className="cropLeft">
                        <span className="smallTitle"> Smart Farming </span>
                        <h2> We're Building Intelligent Agriculture </h2>
                        <p> Discover AI-powered crop recommendations based on soil type, weather forecast, rainfall, season and regional conditions to maximize productivity. </p>
                        <p> Analyze soil composition (Nitrogen, Phosphorus, Potassium, pH) and climatic factors (temperature, humidity, rainfall) to suggest the most profitable and sustainable crops for specific land. </p>
                        <img className="farmerImage" src={crop} alt="" />
                    </div>

                    {/* RIGHT */}

                    <div className="cropRight">
                        <div className="cropTop">
                            <div className="cropHeading">

                                <h3>Crop Recommendation</h3>
                                <p>Recommended Crops</p>

                            </div>

                            <Link to={getStartedPath}>
                                <button className="manageBtn"> Manage Crop → </button>
                            </Link>

                        </div>


                        <div className="cropList">
                            <div className="cropItem">
                                <img src={rice} alt="Rice Image" />
                                <div>
                                    <h4>Rice</h4>
                                    <span> A cereal grain primarily grown as a Kharif (monsoon) crop in India. </span>
                                </div>
                            </div>
                            <div className="cropItem">
                                <img src={maize} alt="Maize Image" />
                                <div>
                                    <h4>Maize</h4>
                                    <span> A cereal grain often referred to as corn. Depending on the region, it is cultivated during both the Kharif and Rabi seasons. </span>
                            </div>
                        </div>

                    <div className="cropItem">
                        <img src={tomato} alt="Tomato Image" />
                            <div>
                                <h4>Tomato</h4>
                                <span> Botanically a fruit, but widely classified and consumed as a vegetable. It is typically grown year-round depending on the local climate. </span>
                            </div>
                    </div>

                    <div className="cropItem">
                        <img src={groundnut} alt="GroundNut Image" />
                        <div>
                            <h4>Groundnut</h4>
                            <span> Also known as peanut, it is a legume commonly grown as a Kharif oilseed crop. </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                            {/* ================= WEATHER ================= */}

        <div className="weatherDashboard">

            {/* Top Section */}
            <div className="weatherTop">
                <div className="weatherTopLeft">
                    <span className="weatherTag"> WEATHER FORECAST </span>
                    <h2 style={{ whiteSpace: "nowrap" }}> Weather Intelligence </h2>
                    <p> Accurate weather insights for smarter farming decisions throughout every season. </p>
                    <br/>
                    <p> Real-time monitoring and forecasting of atmospheric conditions using radar maps, satellite imagery, and automated weather stations. </p>
                </div>

                <div className="weatherTopRight">
                    <img src={weatherHome1} alt="Weather Forecast" />
                </div>
            </div>

            {/* Big Background Text */}
            <h1 className="weatherBigText"> WEATHER </h1>

            {/* Bottom */}
            <div className="weatherBottom">
                <img className="weatherPreview" src={weatherHome2} alt="Weather Dashboard" />
                <div className="weatherContent">
                    <FaCloudSun className="weatherIcon"/>
                    <h3> Weather Intelligence </h3>
                    <p> Get live weather forecasts, rainfall prediction, humidity, wind speed and severe weather alerts to protect your crops. </p>

                    <Link to={getStartedPath}>
                        <button className="weatherBtn"> Check Weather → </button>
                    </Link>
                </div>
            </div>
        </div>

                        {/* ================= Government Schemes ================= */} 
        <div className="schemeCard">

            {/* Top Section */}
            <div className="schemeTop">
                <div className="schemeHeading">
                    <div className="schemeTitle">
                        <FaSeedling className="featureIcon"/>
                        <div>
                            <h3>Government Schemes</h3>
                            <p> Discover central and state government schemes, subsidies, crop insurance and financial assistance specially designed for Indian farmers. </p>
                            <p> The Indian government offers numerous schemes to support farmers with direct income transfers, crop insurance, affordable credit, and machinery subsidies. </p>
                        </div>
                    </div>
                </div>

                <div className="schemeHeroImage">
                    <img src={schemes} alt="Parliament image" />
                </div>
            </div>

            {/* Floating Cards */}
            <div className="schemeCards">
                <div className="miniScheme topLeft">
                    <h4>PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)</h4>
                    <p>Provides eligible landholding farmer families ₹6,000 annually, disbursed in three equal installments of ₹2,000 every four months.</p>
                </div>

                <div className="miniScheme left">
                    <h4>PMFBY (Pradhan Mantri Fasal Bima Yojana)</h4>
                    <p>An affordable crop insurance scheme that covers risks against natural calamities, pests, and crop diseases from pre-sowing to post-harvest.</p>
                </div>

                <div className="miniScheme center">
                    <h4>Kisan Credit Card (KCC)</h4>
                    <p> Provides farmers with flexible, short-term credit at reduced interest rates for crop production, animal husbandry, and fisheries.</p>
                </div>

                <div className="miniScheme right">
                    <h4>AIF (Agriculture Infrastructure Fund)</h4>
                    <p> Offers medium-to-long-term debt financing facilities for investments in projects for post-harvest management infrastructure and community farming assets.</p>
                </div>

                <div className="miniScheme topRight">
                    <h4>SMAM (Sub-Mission on Agricultural Mechanisation)</h4>
                    <p>Provides significant subsidies (ranging from 50% to 80%) to small and women farmers for the purchase of modern agricultural.</p>
                </div>
            </div>

            <div className="schemeBtnDiv">
                <Link to={getStartedPath}>
                    <button className="schemeBtn"> View Schemes → </button>
                </Link>
            </div>
        </div>

                                    {/* ================= AI CHATBOT ================= */}

        <div className="aiDashboard">
            <h1 className="aiTitle"> AI Chatbot </h1>
            <div className="aiContent">

                {/* Left */}
                <div className="aiLeft">
                    <img src={robot} alt="AI Chatbot" />
                </div>

                {/* Center */}
                <div className="aiCenter">
                    <div className="benefitCard">
                        Ask Questions in Any Language
                    </div>

                    <div className="benefitCard">
                        24/7 Instant Farming Assistance
                    </div>

                    <div className="benefitCard">
                        AI Crop Recommendation Support
                    </div>

                    <div className="benefitCard">
                        Weather & Disease Guidance
                    </div>

                    <div className="benefitCard">
                        Fast & Efficient Query resolution
                    </div>

                    <div className="benefitCard">
                        Improved customer Experience
                    </div>
                </div>

                {/* Right */}
                <div className="aiRight">
                    <h2> AI Services </h2>
                    <div className="skillPanel">
                        <ul>
                            <li>AI Crop Recommendation</li>
                            <li>AI Fertilizer Recommendation</li>
                            <li>Plant Disease Detection</li>
                            <li>Crop Yield Prediction</li>
                            <li>Smart Irrigation Advisor</li>
                            <li>AI Farming Chatbot</li>
                            <li>Government Scheme Eligibility Predictor</li>
                        </ul>
                    </div>
                </div>
            </div>

            <Link to={getStartedPath}>
                <button className="robotBtn"> Ask AI Assistant → </button>
            </Link>

        </div>

                        {/* ================= Officer Broadcast ================= */}

        <div className="officerCard">

            {/* LEFT */}
            <div className="officerLeft">
                <h2> Office Broadcast Center </h2>
                <div className="officerColumns">
                    <p> Agricultural officers can publish government notifications, awareness campaigns, subsidy announcements and important farming advisories for farmers across different regions. </p>
                    <p> Broadcast emergency alerts, weather warnings, pest outbreaks and seasonal cultivation recommendations to ensure timely action and improve agricultural productivity.</p>
                </div>

                <div className="officerGallery">
                    <div className="floatingCards">
                        <div className="miniFloat"> 
                            Crop Alerts
                        </div>

                        <div className="miniFloat">
                            Awareness Programs
                        </div>

                        <div className="miniFloat">
                            Government Notices
                        </div>
                    </div>
                    <img src={graph} className="officerMainImage" alt="Graph Analytics" />
                </div>
            </div>

            {/* RIGHT */}
            <div className="officerRight">
                <div className="capsuleOuter">
                    <img src={region} className="officerCapsule" alt="Region" />
                </div>
                    <h4>Connecting Farmers with Trusted Agricultural Guidance</h4>
                    <p> Publish verified announcements, subsidy updates, cultivation practices and emergency notifications directly from agricultural officers. </p>
                    <Link to={getStartedPath}>
                        <button className="officerBtn"> Officer Portal → </button>
                    </Link>
                </div>
            </div>
        </div>
    </div>
</section>

<Footer />
    </div>
  );
};

export default Home;