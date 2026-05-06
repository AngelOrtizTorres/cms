"use client";

import React from "react";
import Container from "@mui/material/Container";
// usar `Box` con CSS grid en lugar de `Grid item` para evitar prop `item` en el DOM
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6">Bienvenido</Typography>
              <Typography variant="body2" color="text.secondary">Resumen rápido del sitio.</Typography>
            </Paper>

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1" gutterBottom>Publicaciones recientes</Typography>
              <Typography variant="body2" color="text.secondary">Aquí iría una lista de artículos.</Typography>
            </Paper>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1">Actividad</Typography>
              <Typography variant="body2" color="text.secondary">Últimas acciones.</Typography>
            </Paper>

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1">Estado del sitio</Typography>
              <Typography variant="body2" color="text.secondary">Estado general.</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
