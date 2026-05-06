"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPostFormData, apiDelete } from "@/lib/api";

type Banner = {
  id: number;
  title: string;
  link?: string;
  link_url?: string;
  image_url?: string;
  active?: boolean;
  type?: 'image' | 'code';
  position?: 'header' | 'sidebar' | 'between_articles' | 'footer';
  code_content?: string | null;
};

export default function BannersManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bannerType, setBannerType] = useState<'image' | 'code'>('image');
  const [position, setPosition] = useState<'header' | 'sidebar' | 'between_articles' | 'footer'>('header');
  const [codeContent, setCodeContent] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const url = siteId ? `/sites/${siteId}/banners` : "/banners";
      const res = await apiGet<Banner[]>(url);
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const list: Banner[] = Array.isArray(res)
        ? (res as unknown as Banner[])
        : (isRecord(res) && Array.isArray((res as Record<string, unknown>)['data']) ? ((res as Record<string, unknown>)['data'] as unknown as Banner[]) : []);
      setBanners(list);
    } catch (err: unknown) {
      console.error(err);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error cargando banners';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const load = async () => { await fetchBanners(); }; load(); }, [siteId]);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title) return setError("Título requerido");
    setSaving(true); setError(null);
    try {
      const form = new FormData();
      form.append("title", title);
      if (link) {
        form.append("link", link);
        form.append("link_url", link);
      }
      form.append('type', bannerType);
      form.append('position', position);
      form.append('active', active ? '1' : '0');
      if (bannerType === 'image' && file) form.append("image", file);
      if (bannerType === 'code') form.append('code_content', codeContent);
      const url = siteId ? `/sites/${siteId}/banners` : "/banners";
      await apiPostFormData(url, form);
      setSuccess("Banner creado");
      setTitle(""); setLink(""); setFile(null);
      setBannerType('image'); setPosition('header'); setCodeContent(''); setActive(true);
      await fetchBanners();
    } catch (err: unknown) {
      console.error(err);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error creando banner';
      setError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este banner?")) return;
    try { await apiDelete(`/banners/${id}`); setSuccess("Banner eliminado"); await fetchBanners(); }
    catch (err: unknown) { console.error(err); const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al eliminar'; setError(msg); }
  };

  return (
    <Container id="banners-manager" maxWidth="lg" sx={{ py: 4 }}>
      <style>{`#banners-manager .MuiInputBase-input::placeholder, #banners-manager .MuiFilledInput-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
      <Typography variant="h4" gutterBottom>Banners</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>Añadir banner</Typography>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
            <TextField label="Enlace (opcional)" value={link} onChange={(e) => setLink(e.target.value)} size="small" fullWidth />

            <FormControl size="small" fullWidth>
              <InputLabel id="banner-type-label">Tipo</InputLabel>
              <Select
                labelId="banner-type-label"
                value={bannerType}
                label="Tipo"
                onChange={(e) => setBannerType(e.target.value as 'image' | 'code')}
              >
                <MenuItem value={'image'}>Imagen</MenuItem>
                <MenuItem value={'code'}>Código (HTML/JS)</MenuItem>
              </Select>
            </FormControl>

            {bannerType === 'image' && (
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            )}

            {bannerType === 'code' && (
              <TextField
                label="Código HTML/JS"
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                size="small"
                fullWidth
                multiline
                minRows={4}
              />
            )}

            <FormControl size="small" fullWidth>
              <InputLabel id="banner-position-label">Posición</InputLabel>
              <Select
                labelId="banner-position-label"
                value={position}
                label="Posición"
                onChange={(e) => setPosition(e.target.value as any)}
              >
                <MenuItem value={'header'}>Cabecera</MenuItem>
                <MenuItem value={'sidebar'}>Sidebar</MenuItem>
                <MenuItem value={'between_articles'}>Entre noticias</MenuItem>
                <MenuItem value={'footer'}>Footer</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Activo" />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear'}</Button>
            </Box>
          </Box>
        </Paper>

        <Box>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Imagen / Código</TableCell>
                    <TableCell>Enlace</TableCell>
                    <TableCell>Posición</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>
                  ) : banners.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>No hay banners</TableCell></TableRow>
                  ) : banners.map(b => (
                    <TableRow key={b.id} hover>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>
                        {b.type === 'code' ? <code style={{ display: 'block', maxWidth: 280, maxHeight: 64, overflow: 'auto' }}>{String(b.code_content ?? '').slice(0, 200)}</code>
                          : (b.image_url ? <img src={b.image_url} alt={b.title} style={{ height: 48 }} /> : '—')}
                      </TableCell>
                      <TableCell>{b.link_url || b.link || '—'}</TableCell>
                      <TableCell>{b.position || '—'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" color="error" onClick={() => handleDelete(b.id)}>Eliminar</Button>
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
