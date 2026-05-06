"use client";

import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { apiPut, apiPostFormData } from '@/lib/api';

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

type Props = {
  open: boolean;
  item?: MediaItem | null;
  siteId?: string | null;
  onClose: () => void;
  onSaved?: (item: MediaItem) => void;
};

export default function MediaModal({ open, item, siteId, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (item) {
      setTitle(item.title ?? '');
      setAlt(item.alt ?? '');
      setCaption(item.caption ?? '');
    } else {
      setTitle(''); setAlt(''); setCaption('');
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const payload = { title, alt, caption };
      const url = siteId ? `/sites/${siteId}/media/${item.id}` : `/media/${item.id}`;
      const res = await apiPut(url, payload);
      const updated = (res && (res as any).data) ? (res as any).data : res;
      onSaved && onSaved(updated as MediaItem);
      onClose();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !item) return;
    const f = e.target.files[0];
    if (!isAllowedFile(f)) { console.error('Tipo no permitido'); return; }
    if (f.size > MAX_SIZE) { console.error('Archivo demasiado grande (máx 250MB)'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', f);
      const url = siteId ? `/sites/${siteId}/media/${item.id}/replace` : `/media/${item.id}/replace`;
      await apiPostFormData(url, form);
      // fetch updated metadata
      const res = await apiPut(siteId ? `/sites/${siteId}/media/${item.id}` : `/media/${item.id}`, {});
      const updated = (res && (res as any).data) ? (res as any).data : res;
      onSaved && onSaved(updated as MediaItem);
      onClose();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalle
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        {!item ? <Typography>Sin archivo</Typography> : (
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                {item.thumbnail_url || item.url ? <img src={item.thumbnail_url ?? item.url} alt={item.title ?? ''} style={{ maxWidth: '100%', maxHeight: 400 }} /> : <Typography>No preview</Typography>}
              </Box>
              <Button variant="outlined" component="label">Reemplazar archivo<input hidden accept="image/*,video/*" type="file" onChange={handleReplaceFile} /></Button>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 360 } }}>
              <TextField label="Título" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 1 }} />
              <TextField label="Alt" fullWidth value={alt} onChange={(e) => setAlt(e.target.value)} sx={{ mb: 1 }} />
              <TextField label="Caption" fullWidth multiline rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} sx={{ mb: 1 }} />
              {loading && <CircularProgress size={20} sx={{ mt: 1 }} />}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
