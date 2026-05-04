"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {}, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await resetPassword(token, email, password, passwordConfirmation);
      setMessage(res?.message || 'Contraseña reestablecida.');
    } catch (err: any) {
      setError(err?.message || 'Error reestableciendo contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 0 }} elevation={3}>
          <Typography variant="h5" gutterBottom>Restablecer contraseña</Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <TextField label="Token" fullWidth required value={token} disabled sx={{ mb: 2 }} />
            <TextField label="Correo electrónico" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Nueva contraseña" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Confirmar contraseña" type="password" fullWidth required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} sx={{ mb: 2 }} />

            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Procesando...' : 'Restablecer contraseña'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
