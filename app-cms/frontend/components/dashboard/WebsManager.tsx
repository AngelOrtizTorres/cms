"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPostFormData, apiDelete } from "@/lib/api";

type Site = {
  id: number;
  slug?: string;
  title: string;
  domain?: string;
  description?: string;
  owner_id?: number;
  creator_email?: string;
};

export default function WebsManager() {
  const auth = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterDomain, setFilterDomain] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTitleRef = useRef<HTMLInputElement | null>(null);

  const fetchSites = async () => {
    setLoading(true);
    try {
      let url = "/sites";
      if (auth.user?.role === "author") url += `?owner=${auth.user.id}`;
      const res = await apiGet<Site[]>(url);
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const list: Site[] = Array.isArray(res)
        ? (res as unknown as Site[])
        : (isRecord(res) && Array.isArray((res as Record<string, unknown>)['data']) ? ((res as Record<string, unknown>)['data'] as unknown as Site[]) : []);
      setSites(list as Site[]);
    } catch (err: unknown) {
      // Evitar log ruidoso en consola para 401 Unauthenticated
      const eAny = err as any;
      const unauth = (eAny && typeof eAny === 'object' && 'status' in eAny && eAny['status'] === 401) || String((eAny?.message || eAny?.data?.message || '')).toLowerCase().includes('unauthenticated');
      if (unauth) {
        setError('No autenticado');
        setSites([]);
      } else {
        console.error("Error fetching sites", eAny?.message ?? err);
        const msg = (typeof eAny === 'object' && eAny !== null && 'message' in eAny) ? String(eAny.message) : 'Error fetching sites';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No llamar a la API hasta que sepamos si la sesión está verificada o exista un usuario en localStorage
    if (!auth.sessionVerified && !auth.user) return;
    const load = async () => { await fetchSites(); };
    load();
  }, [auth.user?.id, auth.sessionVerified]);

  useEffect(() => {
    if (showCreate) setTimeout(() => createTitleRef.current?.focus(), 30);
  }, [showCreate]);

  const filtered = sites.filter((s) => {
    const titleMatch = !filterTitle || (s.title || "").toLowerCase().includes(filterTitle.toLowerCase());
    const domainMatch = !filterDomain || ((s.domain || "") as string).toLowerCase().includes(filterDomain.toLowerCase());
    const emailField = (s.creator_email || "").toString();
    const emailMatch = !filterEmail || emailField.toLowerCase().includes(filterEmail.toLowerCase());

    const baseMatches = titleMatch && domainMatch && emailMatch;
    if (auth.user?.role === "author") return baseMatches && Number(s.owner_id) === Number(auth.user.id);
    return baseMatches;
  });

  const canEdit = (site: Site) => {
    const role = auth.user?.role;
    if (!auth.user) return false;
    if (role === "admin") return true;
    if (role === "author") return Number(site.owner_id) === Number(auth.user?.id);
    return false;
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title || !description || !contactEmail) return setError("Rellena título, descripción y email");
    setCreating(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("email", contactEmail);
      if (domain) form.append("domain", domain);
      if (iconFile) form.append("icon", iconFile);

      await apiPostFormData("/sites", form);
      setSuccess("Web creada");
      setShowCreate(false);
      setTitle("");
      setDomain("");
      setDescription("");
      setContactEmail("");
      setIconFile(null);
      await fetchSites();
    } catch (err: unknown) {
      console.error(err);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error creando la web';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este sitio?")) return;
    try {
      await apiDelete(`/sites/${id}`);
      setSuccess("Web eliminada");
      await fetchSites();
    } catch (err: unknown) {
      console.error(err);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error eliminando la web';
      setError(msg);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Webs</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
        <style>{`#webs-filters .MuiInputBase-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
        <Box id="webs-filters" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Título"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            sx={{
              minWidth: 200,
              '& .MuiInputBase-input::placeholder': { color: 'rgba(0,0,0,0.45)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
            }}
          />
          <TextField
            size="small"
            placeholder="Dominio"
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            sx={{
              minWidth: 160,
              '& .MuiInputBase-input::placeholder': { color: 'rgba(0,0,0,0.45)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
            }}
          />
          <TextField
            size="small"
            placeholder="Correo"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            sx={{
              minWidth: 200,
              '& .MuiInputBase-input::placeholder': { color: 'rgba(0,0,0,0.45)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
            }}
          />
          <Button variant="outlined" onClick={() => { setFilterTitle(''); setFilterDomain(''); setFilterEmail(''); }}>Limpiar</Button>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Button variant="contained" onClick={() => { setTitle(''); setDomain(''); setDescription(''); setContactEmail(''); setIconFile(null); setShowCreate(true); }}>Crear web</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Dominio</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No hay webs</TableCell></TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography>{s.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.description}</Typography>
                  </TableCell>
                  <TableCell>{s.creator_email || s.owner_id}</TableCell>
                  <TableCell>{s.domain || '-'}</TableCell>
                  <TableCell align="right">
                    {s.domain ? (
                      <Button size="small" component={NextLink} href={`https://${s.domain}`} sx={{ mr: 1 }}>Ver</Button>
                    ) : null}
                    <Button size="small" component={NextLink} href={`/dashboard/sites/${s.slug ?? s.id}`} sx={{ mr: 1 }}>Entrar</Button>
                    <Button size="small" component={NextLink} href={`/dashboard/sites/${s.slug ?? s.id}/edit`} sx={{ mr: 1 }}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} fullWidth maxWidth="sm" aria-labelledby="create-site-title">
        <DialogTitle id="create-site-title">Crear web</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField inputRef={createTitleRef} label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth autoFocus />
            <TextField label="Dominio (opcional)" value={domain} onChange={(e) => setDomain(e.target.value)} fullWidth />
            <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />
            <TextField label="Correo de contacto" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} fullWidth />
            <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] ?? null)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating || !auth.user || !auth.sessionVerified}>{creating ? 'Creando...' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
