"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res?.message || 'Se envió el enlace de reseteo si el email existe');
    } catch (err: any) {
      setError(err?.message || 'Error enviando enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 0 }} elevation={3}>
          <Typography variant="h5" gutterBottom>Recuperar contraseña</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Introduce tu correo y te enviaremos un enlace para resetear la contraseña.
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <TextField label="Correo electrónico" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar enlace de reseteo'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
