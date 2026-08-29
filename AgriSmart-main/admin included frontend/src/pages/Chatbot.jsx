import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";

import {
  Bot,
  User,
  Send,
  Mic,
  ImagePlus,
  Globe,
  Leaf,
  Bug,
  CloudSun,
  Landmark,
  Droplets,
} from "lucide-react";

import { addChatMessage, setChatLanguage } from "../main";

export default function Chatbot() {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.agri.chatMessages) || [];
  const chatLanguage = useSelector((state) => state.agri.chatLanguage) || "en";
  const demoMode = useSelector((state) => state.agri.demoMode);
  const token = useSelector((state) => state.agri.token);
  const user = useSelector((state) => state.agri.user);
  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];

  const [messageInput, setMessageInput] = useState("");

  const suggestions = [
    { icon: <Leaf size={18} />, text: "Crop Advice" },
    { icon: <Bug size={18} />, text: "Disease / Pest Control" },
    { icon: <CloudSun size={18} />, text: "Weather Warning" },
    { icon: <Landmark size={18} />, text: "Government Schemes" },
    { icon: <Droplets size={18} />, text: "Irrigation Schedule" },
  ];

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    dispatch(setChatLanguage(lang));
    toast.info(`Language switched to: ${e.target.options[e.target.selectedIndex].text}`);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || messageInput).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Dispatch user message
    dispatch(addChatMessage({ sender: "user", text, time: timeStr }));
    setMessageInput("");

    // 2. Query Chatbot Service
    if (!demoMode && token) {
      try {
        const langCode = chatLanguage === "pun" ? "pb" : chatLanguage;
        
        // Construct contextual chat history list
        const historyPayload = chatMessages.map(msg => ({
          sender: msg.sender,
          text: msg.text
        }));

        const payload = {
          message: text,
          language: langCode,
          farmerName: user ? user.name : "",
          district: user ? user.district : "",
          state: user ? user.state : "",
          soilType: farms.length > 0 ? farms[0].soilType : "Black Soil",
          activeCrops: crops.map(c => c.cropName),
          history: historyPayload
        };

        const res = await fetch("http://localhost:8083/api/crops/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            dispatch(addChatMessage({ sender: "bot", text: data.reply, time: timeStr }));
            return;
          }
        }
      } catch (err) {
        console.warn("Chatbot API offline, fallback to simulated response.");
      }
    }

    // 3. Simulated Response Fallback (Demo Mode / Offline)
    setTimeout(() => {
      let botResponse = "";
      const input = text.toLowerCase();

      if (chatLanguage === "hi") {
        botResponse = "नमस्ते किसान भाई! आपकी मिट्टी और फसल के अनुसार, नाइट्रोजन (यूरिया) का पहला छिड़काव 25-30 दिनों के भीतर करें। मौसम साफ रहने पर ही छिड़काव करें।";
        if (input.includes("बारिश") || input.includes("मौसम") || input.includes("weather") || input.includes("rain")) {
          botResponse = "मौसम विभाग के अनुसार अगले 48 घंटों में आपके क्षेत्र में हल्की बारिश और बादल छाए रहने की संभावना है। कृपया रासायनिक खाद का छिड़काव रोक दें।";
        } else if (input.includes("खाद") || input.includes("fertilizer") || input.includes("npk")) {
          botResponse = "यूरिया और एनपीके (NPK) खाद को दो हिस्सों में बांटें: आधा बोआई के समय, और आधा बोआई के 21-25 दिनों बाद पहली सिंचाई के समय डालें।";
        } else if (input.includes("बीमारी") || input.includes("रोग") || input.includes("pest") || input.includes("disease")) {
          botResponse = "कीटों और फंगस के संक्रमण से बचने के लिए नीम के तेल (नीमाज़ोल) का छिड़काव करें। पत्तों का रंग पीला पड़ने पर ट्राइकोडेरमा जैविक खाद डालें।";
        }
      } else if (chatLanguage === "ta") {
        botResponse = "வணக்கம் விவசாயி நண்பரே! உங்கள் பயிர் வளர்ச்சிக்கு தேவையான உரங்களை 25-30 நாட்களுக்குள் இடவும். மழை பெய்யும் போது உரம் தெளிப்பதை தவிர்க்கவும்.";
        if (input.includes("மழை") || input.includes("வானிலை") || input.includes("weather") || input.includes("rain")) {
          botResponse = "வானிலை அறிக்கையின்படி அடுத்த 48 மணி நேரத்தில் மழை பெய்ய வாய்ப்புள்ளது. எனவே பூச்சிக்கொல்லி மருந்துகள் தெளிப்பதை தள்ளிப்போடவும்.";
        } else if (input.includes("உரம்") || input.includes("fertilizer") || input.includes("npk")) {
          botResponse = "நைட்ரஜன் உரங்களை பிரித்து இடவும். அடி உரமாக பாஸ்பரஸ் மற்றும் பொட்டாஷ் உரங்களை இடவும். இலைவழி தெளிப்பிற்கு யூரியா பயன்படுத்தலாம்.";
        }
      } else if (chatLanguage === "pun") {
        botResponse = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਝੋਨੇ ਦੀ ਫਸਲ ਲਈ ਸਮੇਂ ਸਿਰ ਨਹਿਰੀ ਪਾணி ਲਗਾਓ ਅਤੇ ਯੂਰੀਆ ਸਹੀ ਮਾਤਰਾ ਵਿੱਚ ਪਾਓ।";
        if (input.includes("ਮੀਂਹ") || input.includes("ਮੌਸਮ") || input.includes("weather") || input.includes("rain")) {
          botResponse = "ਅਗਲੇ 48 ਘੰਟਿਆਂ ਵਿੱਚ ਹਲਕੀ ਬਾਰਸ਼ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦਵਾਈਆਂ ਦਾ ਛਿੜਕਾਅ ਰੋਕ ਦਿਓ।";
        } else if (input.includes("ਖਾਦ") || input.includes("fertilizer") || input.includes("npk")) {
          botResponse = "ਐਨ.ਪੀ.ਕੇ. (NPK) ਖਾਦ ਦੀ ਅੱਧੀ ਮਾਤਰਾ ਬਿਜਾਈ ਸਮੇਂ ਅਤੇ ਬਾਕੀ ਬਚੀ ਅੱਧੀ ਮਾਤਰਾ ਪਹਿਲੇ ਪਾਣੀ ਵੇਲੇ ਪਾਓ।";
        }
      } else {
        // English Default Response
        botResponse = "Hello! For optimal crop yield, apply urea split doses at sowing and tillering stages. Verify that soil moisture is kept in range.";
        if (input.includes("rain") || input.includes("weather") || input.includes("forecast")) {
          botResponse = "Weather updates indicate localized showers within 48 hours. I advise postponing chemical fertilizer application until the sky is clear.";
        } else if (input.includes("pest") || input.includes("disease") || input.includes("bug")) {
          botResponse = "Pest warning: High moisture can lead to leaf blast. Spray organic neem seed extract or micro-insecticides immediately.";
        } else if (input.includes("fertilizer") || input.includes("npk") || input.includes("urea")) {
          botResponse = "Standard recommendation for Kharif crops: Apply half N and full PK at sowing, and top-dress remaining N after first weeding.";
        } else if (input.includes("scheme") || input.includes("money") || input.includes("government")) {
          botResponse = "Indian farmers are eligible for PM-KISAN, offering ₹6,000 yearly income support, and Kisan Credit Card short-term credit loans.";
        }
      }

      dispatch(addChatMessage({ sender: "bot", text: botResponse, time: timeStr }));
    }, 1000);
  };

  const handleSuggestionClick = (text) => {
    let queryText = "";
    if (text.includes("Advice")) queryText = "Which crop grows well in my soil type?";
    else if (text.includes("Disease")) queryText = "How do I treat leaf rust disease?";
    else if (text.includes("Weather")) queryText = "Should I water my crop today based on forecast?";
    else if (text.includes("Schemes")) queryText = "Am I eligible for Kisan Credit Card?";
    else if (text.includes("Irrigation")) queryText = "How often should I irrigate my paddy field?";

    handleSend(queryText);
  };

  return (
    <>
      <Navbar />

      <div className="chatbotPage">
        {/* Header */}
        <div className="chatHeader">
          <div>
            <h1>AI Farming Assistant</h1>
            <p>Ask anything related to farming and receive intelligent, AI-powered guidance.</p>
          </div>

          <div className="languageSelector">
            <Globe size={18} />
            <select value={chatLanguage} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="pun">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
        </div>

        {/* Suggestion Cards */}
        <div
          className="suggestionsContainer"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            padding: "0 20px"
          }}
        >
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(s.text)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "#f0fdf4",
                border: "1px solid #cbdcd0",
                borderRadius: "20px",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "13.5px",
                fontWeight: "600"
              }}
            >
              {s.icon}
              {s.text}
            </button>
          ))}
        </div>

        {/* Chat Container */}
        <div className="chatContainer">
          <div className="messages" style={{ overflowY: "auto", maxHeight: "400px" }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "bot" ? "botMessage" : "userMessage"}`}
              >
                {msg.sender === "bot" ? (
                  <>
                    <div className="messageIcon">
                      <Bot size={22} />
                    </div>
                    <div className="messageBubble">
                      {msg.text}
                      <span style={{ display: "block", fontSize: "9px", color: "gray", marginTop: "4px", textAlign: "right" }}>
                        {msg.time}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="messageBubble">
                      {msg.text}
                      <span style={{ display: "block", fontSize: "9px", color: "lightgray", marginTop: "4px", textAlign: "right" }}>
                        {msg.time}
                      </span>
                    </div>
                    <div className="messageIcon">
                      <User size={22} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chatInputContainer"
          >
            <button type="button" className="inputIcon" onClick={() => toast.info("Image upload feature coming soon.")}>
              <ImagePlus size={22} />
            </button>

            <input
              type="text"
              placeholder="Ask anything about farming..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              required
            />

            <button type="button" className="inputIcon" onClick={() => toast.info("Voice typing feature coming soon.")}>
              <Mic size={22} />
            </button>

            <button className="sendButton" type="submit">
              <Send size={20} />
              Send
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}