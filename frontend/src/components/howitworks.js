import React from "react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";

const steps = [
  {
    stepNumber: "1",
    title: "AI-Powered Self Discovery Test",
    description:
      "Begin your journey by taking a free AI-enabled 8-stage Self-Discovery test covering personality, mindset, motivation, and learning style.",
    subfeatures: [
      {
        title: "AI-Powered Self Discovery Test",
        detail:
          "8-stage analysis covering personality, mindset, motivation, and learning style.",
      },
      {
        title: "Generate Self Discovery Report",
        detail:
          "A 20+ page personalized report instantly available on your dashboard—clear, insightful, and completely free.",
      },
    ],
    circleColor: "#3949AB",
  },
  {
    stepNumber: "2",
    title: "Tech-Enabled Career Discovery",
    description:
      "Generate your personalized Career Discovery Report identifying top 5 careers aligned with your traits, including course and college paths.",
    subfeatures: [
      {
        title: "Top 5 Career Matches",
        detail:
          "AI-matched career options tailored to your interests, strengths, and personality profile.",
      },
      {
        title: "Career Roadmap Included",
        detail:
          "Get clarity on the journey ahead—eligibility, course choices, and top institutions for each career.",
      },
    ],
    circleColor: "#A132B2",
  },
  {
    stepNumber: "3",
    title: "Counsellor-Guided Career Clarity",
    description:
      "A certified Career Counsellor guides you through report interpretation and helps build a growth plan tailored to you.",
    subfeatures: [
      {
        title: "1:1 Report Interpretation",
        detail:
          "Your counsellor explains your results and helps you understand your top career options in depth.",
      },
      {
        title: "Profile Building & Growth Plan",
        detail:
          "Get development strategies for weaker traits and guidance on how to prepare for your chosen career path.",
      },
    ],
    circleColor: "#606060",
  },
];

// SVG icon with circle and embedded number text
function StepIconWithNumber({ circleColor, number }) {
  return (
    <svg
      width="238"
      height="238"
      viewBox="0 0 238 238"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 200, maxHeight: 200 }}
    >
      <g filter="url(#shadow)">
        <rect x="33" y="43" width="164" height="164" rx="82" fill="white" />
        <rect
          x="45.5"
          y="55.5"
          width="139"
          height="139"
          rx="69.5"
          stroke={circleColor}
          strokeWidth="25"
        />
      </g>

      {/* Centered number */}
      <text
        x="50%"
        y="50%"
        fill={circleColor}
        fontSize="64"
        fontWeight="bold"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        {number}
      </text>

      <defs>
        <filter
          id="shadow"
          x="0.0999985"
          y="0.0999985"
          width="237.8"
          height="237.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4" dy="-6" />
          <feGaussianBlur stdDeviation="18.45" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.2 0 0 0 0 0.22 0 0 0 0 0.59 0 0 0 0.26 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" color="primary" fontWeight={700} gutterBottom>
            HOW IT WORKS
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Your journey to career clarity happens in just 3 simple steps
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={10}>
          {steps.map(({ stepNumber, title, description, subfeatures, circleColor }, index) => (
            <Grid
              container
              spacing={6}
              key={stepNumber}
              direction={{ xs: "column", lg: index % 2 === 0 ? "row" : "row-reverse" }}
              alignItems="center"
            >
              {/* Icon with embedded number */}
              <Grid item xs={12} lg={4} display="flex" justifyContent="center">
                <StepIconWithNumber circleColor={circleColor} number={stepNumber} />
              </Grid>

              {/* Content */}
              <Grid item xs={12} lg={8}>
                <Paper
                  elevation={5}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${circleColor}22, transparent)`,
                    minHeight: "320px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
                    {title}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" mb={3} flexGrow={1}>
                    {description}
                  </Typography>

                  {/* Subfeatures */}
                  <Grid container spacing={2}>
                    {subfeatures.map(({ title: subTitle, detail }, i) => (
                      <Grid key={i} item xs={12} sm={6}>
                        <Box display="flex" gap={2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              backgroundColor: "#f5f5f5",
                              borderRadius: 1.5,
                              flexShrink: 0,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              color: circleColor,
                              fontWeight: "bold",
                              fontSize: 13,
                              padding: 1,
                              textAlign: "center",
                            }}
                          >
                            {/* Checkmark icon */}
                            <svg
                              width="24"
                              height="24"
                              fill={circleColor}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke={circleColor}
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M8 12l2 2 4-4"
                                stroke={circleColor}
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              color={circleColor}
                              gutterBottom
                            >
                              {subTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {detail}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
