"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type Section = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
  parent?: { id: number; name: string } | null;
  articles_count?: number;
  active?: boolean;
};

export default function CategoriesManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<number | null>(0);
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [site, setSite] = useState<any | null>(null);

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulkAction, setBulkAction] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "single" | "bulk";
    id?: number;
    ids?: number[];
  } | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res: any = await apiGet("/sections");
      const list = Array.isArray(res) ? res : res.data ?? [];
      setSections(list);
    } catch (err) {
      console.error("Error fetching categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (!siteId) return;
    apiGet(`/sites/${siteId}`).then((s: any) => setSite(s)).catch(() => setSite(null));
  }, [siteId]);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, [editingId]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setPosition(0);
    setActive(true);
    setEditingId(null);
  };

  const startEdit = (s: Section) => {
    setEditingId(s.id);
    setName(s.name || "");
    setSlug(s.slug || "");
    setParentId(s.parent_id ?? "");
    setDescription(s.description || "");
    setPosition(s.position ?? 0);
    setActive(!!s.active);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) return alert("Nombre requerido");
    setSaving(true);
    try {
      const payload: any = { name, slug: slug || undefined, parent_id: parentId || undefined, description, position, active };
      if (editingId) {
        await apiPut(`/sections/${editingId}`, payload);
      } else {
        await apiPost("/sections", payload);
      }
      await fetchSections();
      resetForm();
    } catch (err: any) {
      console.error("Error saving category", err);
      alert(err?.message || "Error al guardar la categoría");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setConfirmTarget({ type: "single", id });
    setConfirmOpen(true);
  };

  const openBulkDeleteConfirm = (ids: number[]) => {
    setConfirmTarget({ type: "bulk", ids });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setConfirmOpen(false);

    try {
      if (confirmTarget.type === "single" && confirmTarget.id) {
        await apiDelete(`/sections/${confirmTarget.id}`);
      } else if (confirmTarget.type === "bulk" && confirmTarget.ids) {
        for (const id of confirmTarget.ids) {
          await apiDelete(`/sections/${id}`);
        }
      }
      await fetchSections();
      setSelected({});
    } catch (err: any) {
      console.error("Error deleting", err);
      alert(err?.message || "Error al eliminar");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const handleBulkApply = async () => {
    const ids = Object.keys(selected).filter((k) => selected[Number(k)]).map((k) => Number(k));
    if (ids.length === 0) return alert("Selecciona al menos una categoría");
    if (!bulkAction) return alert("Selecciona una acción");
    if (bulkAction === "delete") {
      openBulkDeleteConfirm(ids);
    }
  };

  const filtered = sections.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) || (s.slug || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q);
  });

  const isSiteOwner = !!(auth.user && site && Number(site.owner_id) === Number(auth.user.id));
  const canManage = auth.user?.role === "admin" || (auth.user?.role === "author" && isSiteOwner);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3 }}>
        <Paper sx={{ p: 3, position: { md: 'sticky' }, top: { md: 24 }, bgcolor: 'background.paper' }} elevation={2}>
          <Typography variant="h6" gutterBottom>Añadir categoría</Typography>
          {!canManage ? (
            <Box sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1 }}>Necesitas ser administrador o propietario de la web para gestionar categorías.</Box>
          ) : (
            <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField inputRef={nameRef} value={name} onChange={(e) => setName(e.target.value)} label="Nombre" variant="filled" size="small" fullWidth />
              <TextField value={slug} onChange={(e) => setSlug(e.target.value)} label="Slug (opcional)" variant="filled" size="small" fullWidth />
              <FormControl size="small" fullWidth>
                <InputLabel>Categoría superior</InputLabel>
                <Select value={parentId} label="Categoría superior" onChange={(e) => setParentId(e.target.value as number | "")}> 
                  <MenuItem value="">Ninguna</MenuItem>
                  {sections.filter(s => !s.parent_id).map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField value={description} onChange={(e) => setDescription(e.target.value)} label="Descripción" variant="filled" size="small" fullWidth multiline rows={4} />
              <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Activa" />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {editingId && <Button variant="outlined" onClick={resetForm}>Cancelar</Button>}
                <Button variant="contained" type="submit" disabled={!canManage || saving}>{saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Añadir categoría')}</Button>
              </Box>
            </Box>
          )}
        </Paper>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Categorías</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField placeholder="Buscar categorías" value={filter} onChange={(e) => setFilter(e.target.value)} size="small" variant="outlined" />
              <Button variant="outlined" onClick={() => setFilter("")}>Limpiar</Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} displayEmpty>
                <MenuItem value="">Acciones en lote</MenuItem>
                <MenuItem value="delete">Eliminar</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleBulkApply} disabled={bulkProcessing}>{bulkProcessing ? 'Procesando...' : 'Aplicar'}</Button>
          </Box>

          <Paper elevation={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.900' }}>
                    <TableCell padding="checkbox">
                      <Checkbox onChange={(e) => { const checked = e.target.checked; const map: Record<number, boolean> = {}; sections.forEach(s => map[s.id] = checked); setSelected(map); }} />
                    </TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6}>No hay categorías</TableCell></TableRow>
                  ) : filtered.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell padding="checkbox"><Checkbox checked={!!selected[s.id]} onChange={() => toggleSelect(s.id)} /></TableCell>
                      <TableCell>
                        <Typography variant="body1">{s.name}</Typography>
                        {s.parent && <Typography variant="caption" color="text.secondary">Padre: {s.parent.name}</Typography>}
                      </TableCell>
                      <TableCell>{s.description || '—'}</TableCell>
                      <TableCell>{s.slug}</TableCell>
                      <TableCell>{s.articles_count ?? 0}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => startEdit(s)}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => openDeleteConfirm(s.id)} disabled={!canManage}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 2, color: 'text.secondary', fontSize: 13 }}>
            Al eliminar una categoría no se eliminan las entradas de esa categoría. En su lugar, las entradas que solo se asignaron a la categoría borrada, se asignan a la categoría por defecto Sin categoría. La categoría por defecto no se puede borrar.
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar {confirmTarget?.type === 'bulk' ? `${confirmTarget?.ids?.length} categorías` : 'esta categoría'}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
