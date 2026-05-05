"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type News = {
  id: number;
  title: string;
  slug?: string;
  status?: string;
  published_at?: string | null;
};

export default function NewsManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const url = siteId ? `/sites/${siteId}/news` : "/news";
      const res: any = await apiGet(url);
      const list = Array.isArray(res) ? res : res.data ?? [];
      setItems(list);
    } catch (err) {
      console.error(err);
      setError((err as any)?.message || "Error cargando noticias");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, [siteId]);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title) return setError("Título requerido");
    setSaving(true); setError(null);
    try {
      const payload: any = { title, slug: slug || undefined, status };
      const url = siteId ? `/sites/${siteId}/news` : "/news";
      await apiPost(url, payload);
      setSuccess("Noticia creada"); setTitle(""); setSlug(""); setStatus("draft");
      await fetchNews();
    } catch (err: any) { console.error(err); setError(err?.message || "Error creando noticia"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('¿Eliminar noticia?')) return; try { await apiDelete(`/news/${id}`); setSuccess('Noticia eliminada'); await fetchNews(); } catch (err: any) { console.error(err); setError(err?.message || 'Error al eliminar'); } };

  const filtered = items.filter(i => { if (!filter) return true; const q = filter.toLowerCase(); return (i.title || '').toLowerCase().includes(q) || (i.slug || '').toLowerCase().includes(q); });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <style>{`#news-filters .MuiInputBase-input::placeholder, #news-filters .MuiFilledInput-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
      <Typography variant="h4" gutterBottom>Noticias</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>Añadir noticia</Typography>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
            <TextField label="Slug (opcional)" value={slug} onChange={(e) => setSlug(e.target.value)} size="small" fullWidth />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} size="small">
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="published">Publicado</MenuItem>
            </Select>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear'}</Button>
            </Box>
          </Box>
        </Paper>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Listado</Typography>
            <Box id="news-filters" sx={{ display: 'flex', gap: 1 }}>
              <TextField placeholder="Buscar" value={filter} onChange={(e) => setFilter(e.target.value)} size="small" />
              <Button variant="outlined" onClick={() => setFilter("")}>Limpiar</Button>
            </Box>
          </Box>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Publicado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No hay noticias</TableCell></TableRow>
                  ) : filtered.map(i => (
                    <TableRow key={i.id} hover>
                      <TableCell>{i.title}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{i.status}</TableCell>
                      <TableCell>{i.published_at ? new Date(i.published_at).toLocaleString() : '-'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" sx={{ mr: 1 }} href={`/dashboard/sites/${siteId}/news/${i.id}`}>Editar</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(i.id)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
