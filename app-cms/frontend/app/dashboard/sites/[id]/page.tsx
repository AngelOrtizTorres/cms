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
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

export default function SiteDashboardPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();

  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Array<Record<string, unknown>> | null>(null);
  const [news, setNews] = useState<Array<Record<string, unknown>> | null>(null);
  const [nwLoading, setNwLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [specificIds, setSpecificIds] = useState<string>("");

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

  // Redirigir silenciosamente si no tiene permisos para entrar
  React.useEffect(() => {
    if (auth.loading) return;
    if (!site) return;
    const allowed = !!(auth.user && site && (site['owner_id'] as number) === auth.user?.id);
    if (!allowed) {
      router.push('/dashboard/webs');
    }
  }, [site, auth.user, auth.loading, router]);

  // Cargar secciones y noticias al obtener el `site`
  useEffect(() => {
    if (!id) return;
    if (!site) return;

    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const res = await apiGet(`/sites/${id}/sections`);
        const list = Array.isArray(res) ? res : (res && (res as any).data ? (res as any).data : []);
        setSections(list as any);
      } catch (err) {
        console.error('Error loading sections', err);
        setSections([]);
      } finally { setSectionsLoading(false); }
    };

    const loadNews = async () => {
      setNwLoading(true);
      try {
        const res = await apiGet(`/sites/${id}/news`);
        const list = Array.isArray(res) ? res : (res && (res as any).data ? (res as any).data : []);
        setNews(list as any);
      } catch (err) {
        console.error('Error loading news', err);
        setNews([]);
      } finally { setNwLoading(false); }
    };

    loadSections();
    loadNews();
  }, [id, site]);

  if (loading) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (error) return <Container sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!site) return <Container sx={{ py: 4 }}>Sitio no encontrado</Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel de {site.title ? String(site.title) : `#${String(site.id ?? '')}`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Dominio: {site.domain ? String(site.domain) : "-"}
      </Typography>
      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 320px' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <NextLink href={`/dashboard/sites/${id}/entries`}><Button variant="contained">Entradas</Button></NextLink>
            <NextLink href={`/dashboard/sites/${id}/media`}><Button variant="outlined">Medios</Button></NextLink>
            <NextLink href={`/dashboard/sites/${id}/news`}><Button variant="outlined">Gestionar noticias</Button></NextLink>
          </Box>

          <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
            <Typography variant="h6">Noticias destacadas</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Puedes cargar noticias concretas por ID (ej: 12,34) o mostrar las más recientes.</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" placeholder="IDs separadas por coma" value={specificIds} onChange={(e) => setSpecificIds(e.target.value)} sx={{ flex: 1 }} />
              <Button variant="contained" onClick={async () => {
                // fetch specific ids
                if (!id) return;
                const raw = specificIds.split(',').map(s => s.trim()).filter(Boolean);
                if (raw.length === 0) {
                  // load recent
                  setNwLoading(true);
                  try {
                    const res = await apiGet(`/sites/${id}/news`);
                    const list = Array.isArray(res) ? res : (res && (res as any).data ? (res as any).data : []);
                    setNews(list as any);
                  } catch (err) { console.error(err); }
                  finally { setNwLoading(false); }
                  return;
                }
                setNwLoading(true);
                try {
                  const results: any[] = [];
                  for (const rid of raw) {
                    try {
                      let r = await apiGet(`/news/${rid}`);
                      if (r && (r as any).data) r = (r as any).data;
                      results.push(r);
                    } catch (err) {
                      console.warn('no se pudo cargar noticia', rid, err);
                    }
                  }
                  setNews(results as any);
                } catch (err) { console.error(err); }
                finally { setNwLoading(false); }
              }}>Cargar</Button>
            </Box>

            {nwLoading ? <Typography>Cargando...</Typography> : (
              <List dense>
                {(!news || news.length === 0) ? (
                  <ListItem><ListItemText primary="No hay noticias cargadas" /></ListItem>
                ) : news.map((n: any) => (
                  <React.Fragment key={String(n.id)}>
                    <ListItem>
                      <ListItemText primary={n.title || `#${n.id}`} secondary={n.published_at ? new Date(n.published_at).toLocaleString() : ''} />
                      <Button size="small" component={NextLink} href={`/dashboard/sites/${id}/news/${n.id}`}>Editar</Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="h6">Secciones</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Lista rápida de secciones del sitio.</Typography>
            {sectionsLoading ? <Typography>Cargando...</Typography> : (
              <List dense>
                {(!sections || sections.length === 0) ? (
                  <ListItem><ListItemText primary="No hay secciones" /></ListItem>
                ) : sections.map((s: any) => (
                  <React.Fragment key={String(s.id)}>
                    <ListItem>
                      <ListItemText primary={s.name || `#${s.id}`} secondary={s.slug || ''} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        <Box>
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="h6">Información</Typography>
            <Typography variant="body2" color="text.secondary">Estado y métricas del sitio (pendiente).</Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
