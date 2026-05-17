"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorIcon from "@mui/icons-material/Error";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
        p: 4,
      }}
    >
      <ErrorIcon sx={{ fontSize: 56, color: "error.main" }} />
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Error en el panel
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", maxWidth: 440 }}
      >
        {error?.message || "Se produjo un error inesperado en esta sección."}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button variant="outlined" onClick={() => router.back()}>
          Volver
        </Button>
        <Button variant="contained" onClick={reset}>
          Reintentar
        </Button>
      </Box>
    </Box>
  );
}
