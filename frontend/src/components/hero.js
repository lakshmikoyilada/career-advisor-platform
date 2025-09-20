import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 12, md: 24 }, // generous vertical padding
        px: { xs: 3, sm: 6, md: 8 }, // horizontal padding
        backgroundColor: "#fff", // white background
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography
          component="h1"
          variant="h2"
          sx={{
            fontWeight: 700,
            color: "#3949AB", // Indigo blue
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: "2rem", sm: "3rem", md: "4rem", lg: "4.5rem" },
            lineHeight: 1.1,
            userSelect: "none",
          }}
        >
          Personalized Career & Skills Advisor
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 650,
            mx: "auto",
            color: "#4B5563", // gray-700
            fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.15rem" },
            fontWeight: 400,
            mb: { xs: 4, sm: 6 },
            userSelect: "none",
          }}
        >
          Empowering Indian students to map skills, discover careers, and prepare
          for the future — beyond generic advice, with AI-driven, individualized guidance.
        </Typography>
        <Button
          href="/form"
          variant="contained"
          size="large"
          sx={{
            px: 8,
            py: 1.75,
            borderRadius: "xl",
            fontWeight: "bold",
            fontSize: "1.125rem",
            background:
              "linear-gradient(to right, #3949AB, #5C6BC0)", // Indigo-blue gradient
            boxShadow:
              "0px 4px 8px rgba(57, 73, 171, 0.4), 0px 6px 12px rgba(92, 107, 192, 0.3)",
            transition: "background 0.3s",
            "&:hover": {
              background:
                "linear-gradient(to right, #5C6BC0, #3949AB)", // reverse gradient on hover
              boxShadow:
                "0px 6px 12px rgba(92, 107, 192, 0.6), 0px 8px 16px rgba(57, 73, 171, 0.5)",
            },
            userSelect: "none",
          }}
        >
          Start Your Journey
        </Button>
      </Container>
    </Box>
  );
}

