import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <main className="hero-section">
        <div className="hero-content">
          <h1>Welcome to AI Career Recommendation System</h1>
          <p className="subtitle">Discover your ideal career path with our AI-powered recommendation engine</p>
          <button 
            onClick={() => navigate("/login")} 
            className="get-started-btn"
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
