"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorIcon from "@mui/icons-material/Error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        background: "linear-gradient(180deg, #0f1720 0%, #0b0f12 100%)",
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: "#e53935" }} />
      <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700 }}>
        Algo salió mal
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.65)",
          textAlign: "center",
          maxWidth: 480,
        }}
      >
        {error?.message ||
          "Se produjo un error inesperado. Por favor, inténtalo de nuevo."}
      </Typography>
      <Button
        variant="contained"
        onClick={reset}
        sx={{ mt: 1, backgroundColor: "#0073aa" }}
      >
        Reintentar
      </Button>
    </Box>
  );
}
