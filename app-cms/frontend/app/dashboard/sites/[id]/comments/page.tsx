"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CommentIcon from "@mui/icons-material/Comment";

export default function SiteCommentsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CommentIcon color="primary" />
          Comentarios
        </Typography>
      </Box>
      <Paper elevation={1}>
        <Divider />
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            La moderación de comentarios estará disponible próximamente.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Aquí podrás aprobar, rechazar y gestionar los comentarios de tus
            noticias y artículos.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
