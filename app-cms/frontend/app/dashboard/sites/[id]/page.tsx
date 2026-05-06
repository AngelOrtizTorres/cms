"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function SiteDashboardPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();

  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!auth.loading && !auth.isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!id) return;
      setLoading(true);
      try {
        const res = await apiGet(`/sites/${id}`);
        setSite(res as unknown as Record<string, unknown>);
      } catch (err: unknown) {
        console.error('Error fetching site', err);
        const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al cargar el sitio';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, auth.isAuthenticated, auth.loading, router]);

  if (loading) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (error) return <Container sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!site) return <Container sx={{ py: 4 }}>Sitio no encontrado</Container>;

  const canEnter = !!(auth.user && site && (site['owner_id'] as number) === auth.user?.id);
  // Si no tiene permisos para entrar, redirigir silenciosamente a la lista de webs
  React.useEffect(() => {
    if (!site) return;
    const allowed = !!(auth.user && site && (site['owner_id'] as number) === auth.user?.id);
    if (!allowed) {
      router.push('/dashboard/webs');
    }
  }, [site, auth.user, router]);

  if (!site) return null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Panel de {site.title || `#${site.id}`}</Typography>
      <Typography variant="body2" color="text.secondary">Dominio: {site.domain || "-"}</Typography>
      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <NextLink href={`/dashboard/sites/${id}/entries`}>
          <Button variant="contained">Entradas</Button>
        </NextLink>
        <NextLink href={`/dashboard/sites/${id}/media`}>
          <Button variant="outlined">Medios</Button>
        </NextLink>
      </Box>
    </Container>
  );
}
