"use client";

import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import WebAssetIcon from "@mui/icons-material/WebAsset";

export default function SitePagesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WebAssetIcon color="primary" />
          Páginas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small">
          Nueva página
        </Button>
      </Box>
      <Paper elevation={1}>
        <Divider />
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            La gestión de páginas estáticas estará disponible próximamente.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Aquí podrás crear páginas como "Sobre nosotros", "Contacto", etc.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
