"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import { registerAdmin } from "@/lib/auth";
import { apiGet } from '@/lib/api';

export default function RegisterAdminPage() {
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
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'Error registrando administrador');
    } finally {
      setLoading(false);
    }
  };

  // Si ya existe admin, redirigir al login y bloquear el formulario
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGet('/admin-exists');
        if (!mounted) return;
        if (res?.admin_exists) {
          router.replace('/login');
        }
      } catch (e) {
        // ignorar errores de comprobación y dejar el formulario disponible
        console.error('error comprobando admin-exists', e);
      }
    })();

    return () => { mounted = false; };
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }} elevation={3} component="form" onSubmit={submit}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img src="/next.svg" alt="logo" style={{ height: 72 }} />
          </Box>

          <Typography variant="h5" gutterBottom>Hola</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa la información para crear la cuenta de administrador del sitio.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField label="Título del sitio" fullWidth value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} sx={{ mb: 2 }} />

          <TextField label="Nombre de usuario" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />

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

          <TextField type="email" label="Tu correo electrónico" fullWidth required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

          <FormControlLabel control={<Checkbox checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} />} label="Pedir a los motores de búsqueda que no indexen este sitio" sx={{ mb: 2 }} />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? 'Instalando...' : 'Instalar sitio y crear administrador'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
