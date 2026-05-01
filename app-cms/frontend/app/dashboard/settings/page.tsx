"use client";

import React, { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
// Stack replaced by Box with sx gap for simpler typing
import { useThemeSettings } from "@/components/MuiProviders";

export default function SettingsPage() {
  const {
    mode,
    toggleMode,
    primaryColor,
    setPrimaryColor,
    compactSidebar,
    setCompactSidebar,
  } = useThemeSettings();
  const [colorValue, setColorValue] = useState(primaryColor);

  const applyColor = () => {
    // Basic validation: ensure it starts with # and is 7 chars
    const v = colorValue.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      setPrimaryColor(v);
    } else {
      // allow user to see invalid input; could show message
      setColorValue(primaryColor);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Ajustes
        </Typography>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
            label={mode === "dark" ? "Modo oscuro" : "Modo claro"}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Color primario</Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              mt: 1,
            }}
          >
            <TextField
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              size="small"
            />
            <Button variant="outlined" onClick={applyColor}>
              Aplicar
            </Button>
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: colorValue,
                borderRadius: 1,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={compactSidebar}
                onChange={(e) => setCompactSidebar(e.target.checked)}
              />
            }
            label="Barra lateral compacta"
          />
          <Typography variant="body2" color="text.secondary">
            Reduce el ancho del menú lateral para un diseño más compacto.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
