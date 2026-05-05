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

  const [site, setSite] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!id) return;
    setLoading(true);
    apiGet(`/sites/${id}`)
      .then((res: any) => setSite(res))
      .catch((err) => {
        console.error("Error fetching site", err);
        setError(err?.message || "Error al cargar el sitio");
      })
      .finally(() => setLoading(false));
  }, [id, auth.isAuthenticated]);

  if (loading) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (error) return <Container sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!site) return <Container sx={{ py: 4 }}>Sitio no encontrado</Container>;

  const canEnter = !!(auth.user && site.owner_id === auth.user?.id);

  if (!canEnter) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>No tienes permisos para ver el panel de esta web.</Typography>
        <Box sx={{ mt: 2 }}>
          <NextLink href="/dashboard/webs">
            <Button variant="outlined">Volver a Webs</Button>
          </NextLink>
        </Box>
      </Container>
    );
  }

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
