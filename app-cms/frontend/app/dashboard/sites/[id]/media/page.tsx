"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPostFormData, apiDelete } from "@/lib/api";
import MediaModal from "@/components/MediaModal";
import MediaPicker from "@/components/MediaPicker";

type MediaItem = {
  id: number;
  title?: string;
  url?: string;
  thumbnail_url?: string;
  mime_type?: string;
  size?: number;
  created_at?: string;
  alt?: string;
  caption?: string;
};

export default function MediaLibraryPage() {
  const params = useParams() as { id: string };
  const siteId = params?.id;
  const auth = useAuth();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterType, setFilterType] = useState<'all'|'images'|'videos'>('all');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [site, setSite] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [siteLoading, setSiteLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);

  const canManage = auth.user?.role === 'admin' || (site && auth.user && Number((site as any).owner_id) === Number(auth.user.id));

  useEffect(() => {
    if (!siteId) { setSite(null); setSiteLoading(false); return; }
    const loadSite = async () => {
      setSiteLoading(true);
      try {
        const s = await apiGet(`/sites/${siteId}`);
        const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
        const resolved = isRecord(s) && 'data' in s ? (s as any).data as Record<string, unknown> : s as Record<string, unknown>;
        setSite(resolved as Record<string, unknown>);
      } catch (err) {
        setSite(null);
      } finally { setSiteLoading(false); }
    };
    loadSite();
  }, [siteId]);

  const parseList = (res: any): MediaItem[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res as MediaItem[];
    if (res.data && Array.isArray(res.data)) return res.data as MediaItem[];
    return [];
  };

  const loadPage = async (p = 1, append = false) => {
    if (!siteId) return;
    setLoading(true); setError(null);
    try {
      const q = new URLSearchParams();
      q.set('page', String(p));
      if (search) q.set('search', search);
      if (filterType !== 'all') q.set('type', filterType);
      const url = `/media?${q.toString()}`;
      const res = await apiGet(url);
      const list = parseList(res);
      if (append) setItems(prev => [...prev, ...list]); else setItems(list);
      setPage(p);
      setHasMore(list.length >= 24);
    } catch (err) {
      console.error(err);
      setError('Error cargando medios');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadPage(1); }, [siteId, filterType, search]);

  useEffect(() => {
    if (auth.loading) return;
    if (!siteId) return;
    if (siteLoading) return;
    if (site === null) return;
    if (!canManage) return;
  }, [siteLoading, site, auth.user, auth.loading, siteId, canManage]);

  if (auth.loading) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (siteLoading && siteId) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (!siteLoading && siteId && !canManage && !auth.loading) return null;

  const MAX_SIZE = 250 * 1024 * 1024; // 250MB
  const allowedVideoExts = ['mp4','webm','mov','mkv','avi','m4v','ogv','ogg'];
  const allowedImageExts = ['png','jpg','jpeg','gif','webp','bmp','svg','heic'];
  const getExt = (name: string) => (name || '').split('.').pop()?.toLowerCase() ?? '';
  const isAllowedFile = (f?: File) => {
    if (!f) return false;
    const t = f.type || '';
    if (t.startsWith('image/')) return true;
    if (t.startsWith('video/')) {
      const ext = getExt(f.name);
      return allowedVideoExts.includes(ext);
    }
    const ext = getExt(f.name);
    return allowedImageExts.includes(ext) || allowedVideoExts.includes(ext);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const invalid: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!isAllowedFile(f)) { invalid.push(`${f.name}: tipo no permitido`); continue; }
        if (f.size > MAX_SIZE) { invalid.push(`${f.name}: demasiado grande (máx 250MB)`); continue; }
        const form = new FormData();
        form.append('file', f);
        form.append('title', f.name);
        const url = '/media';
        await apiPostFormData(url, form);
      }
      if (invalid.length) setError(invalid.join('\n'));
      await loadPage(1);
    } catch (err) {
      console.error(err);
      setError('Error subiendo archivos');
    } finally { setUploading(false); }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteSelected = async () => {
    const ids = Object.keys(selected).filter(k => selected[Number(k)]).map(k => Number(k));
    if (ids.length === 0) return;
    if (!confirm(`Eliminar ${ids.length} archivos?`)) return;
    try {
      for (const id of ids) {
        const url = `/media/${id}`;
        await apiDelete(url);
      }
      setSelected({});
      await loadPage(1);
    } catch (err) {
      console.error(err);
      setError('Error eliminando archivos');
    }
  };

  const openModal = (it: MediaItem) => { setModalItem(it); setModalOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este archivo?')) return;
    try {
      await apiDelete(`/media/${id}`);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); setError('No se pudo eliminar'); }
  };

  const handleSaved = (updated: MediaItem) => {
    setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const filtered = items.filter(it => {
    if (!search) return true;
    return String(it.title ?? it.url ?? '').toLowerCase().includes(search.toLowerCase());
  }).filter(it => {
    if (filterType === 'all') return true;
    if (filterType === 'images') return String(it.mime_type ?? '').startsWith('image/');
    if (filterType === 'videos') return String(it.mime_type ?? '').startsWith('video/');
    return true;
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Biblioteca de medios</Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" component="label" startIcon={<UploadFileIcon />} disabled={uploading}>
          Añadir medios
          <input hidden multiple accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.heic,.mp4,.webm,.mov,.mkv,.avi,.m4v" type="file" onChange={handleFileInput} />
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <InputBase
            placeholder="Buscar medios"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<SearchIcon sx={{ mr: 1 }} />}
            sx={{ border: '1px solid rgba(0,0,0,0.08)', px:1, py:0.5, borderRadius:1, width: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="filter-type-label">Tipo</InputLabel>
            <Select labelId="filter-type-label" value={filterType} label="Tipo" onChange={(e) => setFilterType(String(e.target.value) as any)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="images">Imágenes</MenuItem>
              <MenuItem value="videos">Vídeos</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Actualizar"><IconButton onClick={() => loadPage(1)}><RefreshIcon /></IconButton></Tooltip>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant={selectionMode ? 'contained' : 'outlined'} onClick={() => setSelectionMode(s => !s)}>
            {selectionMode ? 'Salir selección' : 'Seleccionar en lotes'}
          </Button>
          {selectionMode && (
            <Button color="error" startIcon={<DeleteIcon />} onClick={deleteSelected} disabled={Object.values(selected).filter(Boolean).length === 0}>
              Eliminar seleccionados
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary">No hay medios</Typography>
        ) : (
          <>
            <MediaPicker items={filtered} selectionMode={selectionMode} selected={selected} onToggleSelect={toggleSelect} onOpen={openModal} onDelete={handleDelete} />
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={() => loadPage(page + 1)} disabled={loading}>Cargar más</Button>
              </Box>
            )}
          </>
        )}
      </Paper>

      {error && <Typography color="error" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{error}</Typography>}

      <MediaModal open={modalOpen} item={modalItem} siteId={siteId} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </Container>
  );
}
