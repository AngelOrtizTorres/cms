"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from '@/lib/api';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  // Comprobar si ya existe administrador para ocultar CTA de registro
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGet('/admin-exists');
        if (!mounted) return;
        setAdminExists(Boolean(res?.admin_exists));
      } catch (e) {
        // En caso de error, dejamos visible el botón para compatibilidad
        console.error('No se pudo comprobar admin-exists', e);
        if (mounted) setAdminExists(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 1, minWidth: 360, width: 420 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Acceder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Introduce tus credenciales
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Accediendo..." : "Acceder"}
            </Button>

              {adminExists === false && (
                <Button
                  component={NextLink}
                  href="/register"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Crear cuenta de administrador
                </Button>
              )}
              {adminExists === true && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  Registro de administrador deshabilitado
                </Typography>
              )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Link
                component={NextLink}
                href="/forgot-password"
                variant="body2"
              >
                ¿Olvidaste la contraseña?
              </Link>
              <Link component={NextLink} href="/" variant="body2">
                ← Volver al sitio
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          © 2026 - Panel estilo WordPress
        </Typography>
      </Box>
    </Container>
  );
}
