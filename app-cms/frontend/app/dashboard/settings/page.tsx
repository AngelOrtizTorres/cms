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
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
// Stack replaced by Box with sx gap for simpler typing
import { useThemeSettings } from "@/components/MuiProviders";

export default function SettingsPage() {
  const {
    mode,
    toggleMode,
    primaryColor,
    setMode,
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

  const exportSettings = () => {
    const data = {
      theme_mode: mode,
      primary_color: primaryColor,
      compact_sidebar: compactSidebar ? 1 : 0,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cms-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      if (obj.theme_mode) setMode(obj.theme_mode);
      if (obj.primary_color) setPrimaryColor(obj.primary_color);
      if (typeof obj.compact_sidebar !== "undefined")
        setCompactSidebar(Boolean(obj.compact_sidebar));
    } catch (e) {
      console.error("Import failed", e);
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

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Import / Export de ajustes
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportSettings}
            >
              Exportar ajustes
            </Button>

            <label>
              <Input
                sx={{ display: "none" }}
                id="import-settings"
                type="file"
                inputProps={{ accept: ".json" }}
                onChange={(e) =>
                  handleImportFile(
                    (e.currentTarget as HTMLInputElement).files?.[0] ?? null,
                  )
                }
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={<FileUploadIcon />}
              >
                Importar ajustes
              </Button>
            </label>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
