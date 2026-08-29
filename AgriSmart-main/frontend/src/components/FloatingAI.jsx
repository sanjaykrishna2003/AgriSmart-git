import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

import "./components.css";

function FloatingAI() {

    const navigate = useNavigate();

    return (

        <button
            className="floatingAI"
            onClick={() => navigate("/chatbot")}
        >

            <Bot size={26} />

            <span>Ask AI</span>

        </button>

    );

}

export default FloatingAI;