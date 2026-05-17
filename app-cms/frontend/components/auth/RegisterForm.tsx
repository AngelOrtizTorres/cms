"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { registerAdmin } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [siteTitle, setSiteTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [noIndex, setNoIndex] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerAdmin(name, email, password, passwordConfirmation);
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Error registrando administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#0f1720 0%, #0b0f12 100%)",
        py: 8,
      }}
    >
      <Paper
        elevation={8}
        component="form"
        onSubmit={submit}
        sx={{
          p: 4,
          borderRadius: 0,
          minWidth: 360,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
          bgcolor: "rgba(10,12,15,0.92)",
          border: (theme) =>
            theme.palette.mode === "light"
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid rgba(255,255,255,0.06)",
          color: (theme) => theme.palette.text.primary,
          "& .MuiTypography-root": {
            color: (theme) => theme.palette.text.primary,
          },
          "& .MuiInputBase-input": {
            color: (theme) => theme.palette.text.primary,
          },
          "& .MuiInputLabel-root": {
            color: (theme) => theme.palette.text.secondary,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) => theme.palette.divider,
          },
          "& .MuiFormControlLabel-label": {
            color: (theme) => theme.palette.text.primary,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 64, height: 64 }}>
            <LockOutlinedIcon sx={{ color: "inherit" }} />
          </Avatar>
          <Typography component="h1" variant="h5">
            Hola
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Completa la información para crear la cuenta de administrador del
            sitio.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <TextField
            label="Título del sitio"
            fullWidth
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nombre de usuario"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="Contraseña"
            fullWidth
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            type="password"
            label="Confirmar contraseña"
            fullWidth
            required
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            type="email"
            label="Tu correo electrónico"
            fullWidth
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                color="primary"
              />
            }
            label="Pedir a los motores de búsqueda que no indexen este sitio"
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
            }}
            disabled={loading}
            aria-disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {loading ? "Instalando..." : "Instalar sitio y crear administrador"}
          </Button>
          <Button
            component={NextLink}
            href="/login"
            fullWidth
            variant="text"
            sx={{ mt: 1, textTransform: "none" }}
            aria-label="Iniciar sesión"
          >
            Iniciar sesión
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
