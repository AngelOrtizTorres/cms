"use client";

import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';

type MediaItem = {
  id: number;
  title?: string;
  url?: string;
  thumbnail_url?: string;
  mime_type?: string;
  size?: number;
  created_at?: string;
};

type Props = {
  items: MediaItem[];
  selectionMode?: boolean;
  selected?: Record<number, boolean>;
  onToggleSelect?: (id: number) => void;
  onOpen?: (item: MediaItem) => void;
  onDelete?: (id: number) => void;
};

export default function MediaPicker({ items, selectionMode = false, selected = {}, onToggleSelect, onOpen, onDelete }: Props) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
      {items.map(it => (
        <Paper key={it.id} variant="outlined" sx={{ position: 'relative', overflow: 'hidden', cursor: onOpen ? 'pointer' : 'default' }}>
          {selectionMode && (
            <Checkbox checked={!!selected[it.id]} onChange={(e) => { e.stopPropagation(); onToggleSelect && onToggleSelect(it.id); }} sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }} />
          )}
          <Box onClick={() => onOpen && onOpen(it)} sx={{ width: '100%', height: 160, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {it.thumbnail_url || it.url ? (
              <img src={it.thumbnail_url ?? it.url} alt={it.title ?? ''} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }} />
            ) : (
              <Typography color="text.secondary">—</Typography>
            )}
          </Box>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title ?? (`#${it.id}`)}</Typography>
            <Tooltip title="Eliminar"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(it.id); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
