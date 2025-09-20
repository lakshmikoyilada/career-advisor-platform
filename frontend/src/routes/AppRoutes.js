import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Header";
import Signup from "../pages/signup";
import Login from "../pages/login";
import Profile from "../pages/Profile";
import Roadmap from "../pages/Roadmap";
import HomePage from "../pages/HomePage";
import { AuthContext } from "../context/AuthContext";

const AppRoutes = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div style={{ 
        paddingTop: 'var(--navbar-height, 6rem)',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <Login />} />
          <Route path="/signup" element={isLoggedIn ? <Navigate to="/profile" /> : <Signup />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/roadmap" element={isLoggedIn ? <Roadmap /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

export default AppRoutes;
