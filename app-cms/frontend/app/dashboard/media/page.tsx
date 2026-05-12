'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface MediaFile {
  id: number;
  title: string;
  url: string;
  thumbnail_url: string;
  mime_type: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at: string;
}

export default function MediaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load media
  useEffect(() => {
    loadMedia();
  }, [filter]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeFilter = filter === 'all' ? '' : `?type=${filter === 'images' ? 'images' : 'videos'}`;
      const res = await apiGet(`/media${typeFilter}&limit=200`);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMedia(list as MediaFile[]);
    } catch (err) {
      setError('Error al cargar medios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/media`,
          {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }

        const newMedia = await response.json();
        setMedia([newMedia, ...media]);
      } catch (err) {
        console.error(err);
        setUploadError(`Error al subir ${file.name}`);
      }
    }

    setUploading(false);
    // Reset file input
    const input = e.target as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este medio?')) return;

    try {
      await apiDelete(`/media/${id}`);
      setMedia(media.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el medio');
    }
  };

  const handleEditOpen = (mediaItem: MediaFile) => {
    setEditingMedia(mediaItem);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingMedia) return;
    setMedia(
      media.map((m) => (m.id === editingMedia.id ? editingMedia : m))
    );
    setEditDialogOpen(false);
    setEditingMedia(null);
  };

  const getMediaType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Galería de Medios</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <Button
            variant="contained"
            onClick={() => document.getElementById('media-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Subir Medios'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {uploadError && <Alert severity="warning" sx={{ mb: 2 }}>{uploadError}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          Todos ({media.length})
        </Button>
        <Button
          variant={filter === 'images' ? 'contained' : 'outlined'}
          startIcon={<ImageIcon />}
          onClick={() => setFilter('images')}
        >
          Imágenes
        </Button>
        <Button
          variant={filter === 'videos' ? 'contained' : 'outlined'}
          startIcon={<VideoIcon />}
          onClick={() => setFilter('videos')}
        >
          Videos
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : media.length === 0 ? (
        <Alert severity="info">No hay medios. ¡Sube algunos!</Alert>
      ) : (
        <Grid container spacing={2}>
          {media.map((mediaItem) => {
            const type = getMediaType(mediaItem.mime_type);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={mediaItem.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '66.66%',
                      backgroundColor: '#f0f0f0',
                      overflow: 'hidden',
                    }}
                  >
                    {type === 'image' ? (
                      <Box
                        component="img"
                        src={mediaItem.url}
                        alt={mediaItem.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#000',
                        }}
                      >
                        <VideoIcon sx={{ fontSize: 48, color: '#fff' }} />
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        p: 1,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Descargar">
                        <IconButton
                          size="small"
                          href={mediaItem.url}
                          download
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(mediaItem.id)}
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(244,67,54,0.9)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {mediaItem.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatFileSize(mediaItem.size)}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={type === 'image' ? 'Imagen' : 'Video'}
                        variant="outlined"
                      />
                      {mediaItem.width && mediaItem.height && type === 'image' && (
                        <Chip
                          size="small"
                          label={`${mediaItem.width}×${mediaItem.height}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Medio</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editingMedia && (
            <Stack spacing={2}>
              <TextField
                label="Título"
                fullWidth
                value={editingMedia.title}
                onChange={(e) =>
                  setEditingMedia({ ...editingMedia, title: e.target.value })
                }
              />
              <TextField
                label="Texto Alternativo"
                fullWidth
                multiline
                rows={2}
                value={editingMedia.alt_text || ''}
                onChange={(e) =>
                  setEditingMedia({ ...editingMedia, alt_text: e.target.value })
                }
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleEditSave}>
                  Guardar
                </Button>
                <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
