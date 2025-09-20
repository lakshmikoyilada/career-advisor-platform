import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout(); // This will handle the token removal and redirect
    setIsMenuOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="logo" onClick={() => navigateTo("/")}>
          AI Career Guide
        </div>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <nav>
            <a 
              href="/" 
              className={location.pathname === '/' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/");
              }}
            >
              Home
            </a>
          </nav>
          
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigateTo("/profile")}
                  className="btn btn-outline"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo("/login")}
                  className="btn btn-outline"
                >
                  Login
                </button>
                <button
                  onClick={() => navigateTo("/signup")}
                  className="btn btn-primary"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
        
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
