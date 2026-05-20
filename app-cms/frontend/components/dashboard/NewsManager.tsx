"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
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
  IconButton,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

type News = {
  id: number;
  title: string;
  slug?: string;
  status?: string;
  published_at?: string | null;
  primary_section_id?: number | null;
};

function SortableNewsRow({
  item,
  canReorder,
  onDelete,
  siteId,
}: {
  item: News;
  canReorder: boolean;
  onDelete: (id: number) => void;
  siteId?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled: !canReorder,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} hover>
      <TableCell sx={{ width: 40 }}>
        {canReorder && (
          <Tooltip title="Arrastrar para ordenar">
            <IconButton size="small" {...attributes} {...listeners}>
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
      <TableCell>{item.title}</TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>{item.status}</TableCell>
      <TableCell>{item.published_at ? new Date(item.published_at).toLocaleString() : '-'}</TableCell>
      <TableCell align="right">
        <Button size="small" sx={{ mr: 1 }} href={`/dashboard/sites/${siteId}/news/${item.id}`}>Editar</Button>
        <Button size="small" color="error" onClick={() => onDelete(item.id)}>Eliminar</Button>
      </TableCell>
    </TableRow>
  );
}

export default function NewsManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  // site: undefined = loading, null = not found, object = site
  const [site, setSite] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [siteLoading, setSiteLoading] = useState(true);
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
      const res = await apiGet<News[]>(url);
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const list: News[] = Array.isArray(res)
        ? (res as unknown as News[])
        : (isRecord(res) && Array.isArray((res as Record<string, unknown>)['data']) ? ((res as Record<string, unknown>)['data'] as unknown as News[]) : []);
      setItems(list);
    } catch (err: unknown) {
      console.error(err);
      const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error cargando noticias';
      setError(msg);
    } finally { setLoading(false); }
  };

  useEffect(() => { const load = async () => { await fetchNews(); }; load(); }, [siteId]);

  useEffect(() => {
    if (!siteId) { setSite(null); setSiteLoading(false); return; }

    const loadSite = async () => {
      setSiteLoading(true);
      try {
        const s = await apiGet(`/sites/${siteId}`);
        const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
        if (isRecord(s)) setSite(s as unknown as Record<string, unknown>);
        else setSite(null);
      } catch {
        setSite(null);
      } finally {
        setSiteLoading(false);
      }
    };

    loadSite();
  }, [siteId]);

  const router = useRouter();
  const isSiteOwner = !!(auth.user && site && Number((site as Record<string, unknown>).owner_id) === Number(auth.user.id));
  const canManage = auth.user?.role === 'admin' || (auth.user?.role === 'author' && isSiteOwner);
  const canReorder = auth.user?.role === 'author' && isSiteOwner;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  useEffect(() => {
    if (auth.loading) return;
    if (!siteId) return;
    if (siteLoading) return;
    if (site === null) { router.push('/dashboard/webs'); return; }
    if (!canManage) router.push('/dashboard/webs');
  }, [siteLoading, site, auth.user, auth.loading, router, siteId]);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title) return setError("Título requerido");
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = { title, slug: slug || undefined, status };
      const url = siteId ? `/sites/${siteId}/news` : "/news";
      await apiPost(url, payload);
      setSuccess("Noticia creada"); setTitle(""); setSlug(""); setStatus("draft");
      await fetchNews();
    } catch (err: unknown) { console.error(err); const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error creando noticia'; setError(msg); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('¿Eliminar noticia?')) return; try { await apiDelete(`/news/${id}`); setSuccess('Noticia eliminada'); await fetchNews(); } catch (err: unknown) { console.error(err); const msg = (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>)['message']) : 'Error al eliminar'; setError(msg); } };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canReorder || !siteId) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((n) => n.id === Number(active.id));
    const newIndex = items.findIndex((n) => n.id === Number(over.id));
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    try {
      await apiPut(`/sites/${siteId}/news/reorder`, {
        items: reordered.map((n, idx) => ({
          id: n.id,
          position: idx,
          section_id: n.primary_section_id ?? undefined,
        })),
      });
    } catch (err) {
      console.error('Error reordering news', err);
      await fetchNews();
    }
  };

  const filtered = items.filter(i => { if (!filter) return true; const q = filter.toLowerCase(); return (i.title || '').toLowerCase().includes(q) || (i.slug || '').toLowerCase().includes(q); });

  if (auth.loading) return <Container maxWidth="lg" sx={{ py: 4 }}>Cargando...</Container>;
  if (siteLoading && siteId) return <Container maxWidth="lg" sx={{ py: 4 }}>Cargando...</Container>;
  if (!siteLoading && siteId && !canManage && !auth.loading) return null;

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
            <Select value={status} onChange={(e) => setStatus(String((e.target as HTMLInputElement).value))} size="small">
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
                    <TableCell sx={{ width: 40 }}></TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Publicado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>No hay noticias</TableCell></TableRow>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {filtered.map((i) => (
                          <SortableNewsRow
                            key={i.id}
                            item={i}
                            canReorder={canReorder && !filter}
                            onDelete={handleDelete}
                            siteId={siteId}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
