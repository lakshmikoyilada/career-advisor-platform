import React from "react";
import HeroSection from "../components/hero";
import HowItWorks from "../components/howitworks";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";

const howItWorksSteps = [
  {
    step: "Step 01",
    title: "AI-Powered Self Discovery Test",
    description:
      "Begin your journey with an AI-enabled 8-stage Self-Discovery test. This evaluates personality, mindset, motivation, and learning styles.",
  },
  {
    step: "Step 02",
    title: "Tech-Enabled Career Discovery",
    description:
      "Generate a personalized Career Discovery Report with top career matches and detailed roadmaps including courses, exams, and colleges.",
  },
  {
    step: "Step 03",
    title: "Counsellor-Guided Career Clarity",
    description:
      "A certified counsellor reviews your reports, provides 1:1 interpretation, and helps you build a growth plan.",
  },
];

export default function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Career Advisor
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Link href="#" color="inherit" underline="none">
              Home
            </Link>
            <Link href="#how-it-works" color="inherit" underline="none">
              How It Works
            </Link>
            <Link href="/resume" color="inherit" underline="none">
              Resume
            </Link>
            <Link href="/mock-interview" color="inherit" underline="none">
              Mock Interview
            </Link>
            <Link href="/dashboard" color="inherit" underline="none">
              Dashboard
            </Link>
            <Link href="/login" color="inherit" underline="none">
              Login
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content container */}
      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 6 }}>
        {/* Hero Section */}
        <HeroSection />

        {/* Spacer */}
        <Box sx={{ my: 6 }} />

        {/* How It Works */}
            <HowItWorks />
       
        </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "primary.main",
          py: 3,
          mt: "auto",
          textAlign: "center",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} AI Career Advisor Platform. All
          rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
