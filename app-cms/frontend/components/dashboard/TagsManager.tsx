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
  Alert,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type Tag = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  articles_count?: number;
};

export default function TagsManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const url = siteId ? `/sites/${siteId}/tags` : "/tags";
      const res = await apiGet<Tag[]>(url);
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const list: Tag[] = Array.isArray(res)
        ? (res as unknown as Tag[])
        : (isRecord(res) && Array.isArray((res as Record<string, unknown>)['data']) ? ((res as Record<string, unknown>)['data'] as unknown as Tag[]) : []);
      setTags(list);
    } catch (err) {
      console.error("Error fetching tags", err);
      setTags([]);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al cargar etiquetas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const load = async () => { await fetchTags(); }; load(); }, [siteId]);
  useEffect(() => { if (nameRef.current) nameRef.current.focus(); }, [editingId]);

  const resetForm = () => { setName(""); setSlug(""); setDescription(""); setEditingId(null); };
  const startEdit = (t: Tag) => { setEditingId(t.id); setName(t.name || ""); setSlug(t.slug || ""); setDescription(t.description || ""); };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) return setError("Nombre requerido");
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = { name, slug: slug || undefined, description: description || undefined };
      if (editingId) {
        await apiPut(`/tags/${editingId}`, payload);
        setSuccess("Etiqueta actualizada");
      } else {
        const url = siteId ? `/sites/${siteId}/tags` : "/tags";
        await apiPost(url, payload);
        setSuccess("Etiqueta creada");
      }
      resetForm(); await fetchTags();
    } catch (err: unknown) {
      console.error(err); const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al guardar etiqueta'; setError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar etiqueta?")) return;
    try { await apiDelete(`/tags/${id}`); setSuccess("Etiqueta eliminada"); await fetchTags(); }
    catch (err: unknown) { console.error(err); const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al eliminar'; setError(msg); }
  };

  const filtered = tags.filter(t => {
    if (!filter) return true; const q = filter.toLowerCase(); return (t.name || "").toLowerCase().includes(q) || (t.slug || "").toLowerCase().includes(q);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Etiquetas</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3 }}>
          <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>{editingId ? 'Editar etiqueta' : 'Añadir etiqueta'}</Typography>
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField inputRef={nameRef} label="Nombre" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
            <TextField
              label="Slug (opcional)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              size="small"
              fullWidth
              helperText={"El «slug» es la versión amigable de la URL para el nombre. Suele estar en minúsculas y contener solo letras, números y guiones."}
            />
            <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} size="small" fullWidth multiline rows={4} />
            <Typography variant="body2" color="text.secondary">La descripción no se muestra por defecto; sin embargo, hay algunos temas que pueden mostrarla.</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {editingId && <Button variant="outlined" onClick={resetForm}>Cancelar</Button>}
              <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Actualizar etiqueta' : 'Añadir etiqueta')}</Button>
            </Box>
          </Box>
        </Paper>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Listado</Typography>
            <style>{`#tags-filters .MuiInputBase-input::placeholder, #tags-filters .MuiFilledInput-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
            <Box id="tags-filters" sx={{ display: 'flex', gap: 1 }}>
              <TextField placeholder="Buscar" value={filter} onChange={(e) => setFilter(e.target.value)} size="small" />
              <Button variant="outlined" onClick={() => setFilter("")}>Limpiar</Button>
            </Box>
          </Box>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>No hay etiquetas</TableCell></TableRow>
                  ) : filtered.map(t => (
                    <TableRow key={t.id} hover>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.description || '—'}</TableCell>
                      <TableCell>{t.slug}</TableCell>
                      <TableCell>{t.articles_count ?? 0}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => startEdit(t)} sx={{ mr: 1 }}>Editar</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(t.id)}>Eliminar</Button>
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
