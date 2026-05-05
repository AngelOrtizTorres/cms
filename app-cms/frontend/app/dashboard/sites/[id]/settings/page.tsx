"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SiteSettingsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();
  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const s = await apiGet(`/sites/${id}`);
        setSite(s as unknown as Record<string, unknown>);
      } catch (e: unknown) {
        const msg = (typeof e === 'object' && e !== null && 'message' in e) ? String((e as Record<string, unknown>)['message']) : 'Error';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Container id="site-settings" sx={{ py: 4 }}>Cargando...</Container>;
  if (error) return <Container id="site-settings" sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!site) return <Container id="site-settings" sx={{ py: 4 }}>Sitio no encontrado</Container>;

  const canManage = auth.user?.role === 'admin' || Number(site.owner_id) === Number(auth.user?.id);
  if (!canManage) return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5">Configuración</Typography>
      <Typography>No tienes permisos para modificar la configuración de esta web.</Typography>
      <Box sx={{ mt: 2 }}>
        <Button onClick={() => router.push('/dashboard/webs')}>Volver</Button>
      </Box>
    </Container>
  );

  return (
    <Container id="site-settings" sx={{ py: 4 }}>
      <style>{`#site-settings .MuiInputBase-input::placeholder, #site-settings .MuiFilledInput-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Configuración de {site.title || `#${site.id}`}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">Aquí puedes añadir opciones específicas de la web (placeholder).</Typography>
        </Box>
      </Paper>
    </Container>
  );
}
