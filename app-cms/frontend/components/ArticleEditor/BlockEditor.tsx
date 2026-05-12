'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Select,
  Stack,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  TextFields as HeadingIcon,
  Notes as ParaIcon,
  Image as ImageIcon,
  FormatQuote as QuoteIcon,
  FormatListBulleted as ListIcon,
  HorizontalRule as DividerIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Close as CloseIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { apiGet } from '@/lib/api';

export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'list' | 'divider' | 'video' | 'button';
  content?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaId?: number;
  listItems?: string[];
  listType?: 'ordered' | 'unordered';
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  videoUrl?: string;
  videoMediaId?: number;
  buttonText?: string;
  buttonUrl?: string;
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  siteId?: string;
}

type MediaItem = {
  id: number;
  title?: string;
  url?: string;
  thumbnail_url?: string;
  mime_type?: string;
};

const BLOCK_TYPES = [
  { id: 'heading', label: 'Encabezado', icon: HeadingIcon, color: '#1976d2' },
  { id: 'paragraph', label: 'Párrafo', icon: ParaIcon, color: '#424242' },
  { id: 'image', label: 'Imagen', icon: ImageIcon, color: '#7b1fa2' },
  { id: 'video', label: 'Vídeo', icon: DividerIcon, color: '#d32f2f' },
  { id: 'quote', label: 'Cita', icon: QuoteIcon, color: '#f57c00' },
  { id: 'list', label: 'Lista', icon: ListIcon, color: '#388e3c' },
  { id: 'divider', label: 'Separador', icon: DividerIcon, color: '#757575' },
] as const;

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange, siteId }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'video' | null>(null);
  const [selectedBlockForMedia, setSelectedBlockForMedia] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaPickerOpen || !siteId) return;
    
    const loadMedia = async () => {
      setMediaLoading(true);
      setMediaError(null);
      try {
        const typeFilter = mediaPickerType === 'image' ? 'images' : 'videos';
        // Try without site ID first (global media)
        const res = await apiGet(`/media?type=${typeFilter}&limit=100`);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setMediaItems(list as MediaItem[]);
      } catch (err) {
        setMediaError('Error cargando medios');
        console.error(err);
      } finally {
        setMediaLoading(false);
      }
    };
    
    loadMedia();
  }, [mediaPickerOpen, mediaPickerType, siteId]);

  const openMediaPicker = (blockId: string, type: 'image' | 'video') => {
    setSelectedBlockForMedia(blockId);
    setMediaPickerType(type);
    setMediaPickerOpen(true);
  };

  const selectMedia = (media: MediaItem) => {
    if (!selectedBlockForMedia) return;
    
    if (mediaPickerType === 'image') {
      updateBlock(selectedBlockForMedia, {
        imageMediaId: media.id,
        imageUrl: media.url,
      });
    } else if (mediaPickerType === 'video') {
      updateBlock(selectedBlockForMedia, {
        videoMediaId: media.id,
        videoUrl: media.url,
      });
    }
    
    setMediaPickerOpen(false);
    setSelectedBlockForMedia(null);
    setMediaPickerType(null);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setMediaLoading(true);
    setMediaError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/media`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }
      
      const newMedia = await response.json();
      
      // Add to media list and select it
      setMediaItems([newMedia, ...mediaItems]);
      selectMedia(newMedia);
    } catch (err) {
      setMediaError('Error al subir el archivo');
      console.error(err);
    } finally {
      setMediaLoading(false);
      // Reset file input
      const input = document.getElementById('media-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      listItems: type === 'list' ? [''] : undefined,
      listType: 'unordered',
      align: 'left',
      bold: false,
      italic: false,
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = blocks.findIndex((b) => b.id === draggedId);
    const targetIndex = blocks.findIndex((b) => b.id === targetId);

    const newBlocks = [...blocks];
    [newBlocks[draggedIndex], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[draggedIndex],
    ];
    onChange(newBlocks);
    setDraggedId(null);
  };

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
      {/* Toolbar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' },
          gap: 1,
        }}
      >
        {BLOCK_TYPES.map((blockType) => (
          <Tooltip key={blockType.id} title={blockType.label}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => addBlock(blockType.id as any)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                py: 1,
                '&:hover': { bgcolor: '#e0e0e0' },
              }}
            >
              <blockType.icon sx={{ fontSize: 20, color: blockType.color }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', textAlign: 'center' }}>
                {blockType.label}
              </Typography>
            </Button>
          </Tooltip>
        ))}
      </Paper>

      {/* Blocks Canvas */}
      <Stack spacing={2}>
        {blocks.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: '#fafafa',
              border: '2px dashed #ddd',
              borderRadius: 1,
            }}
          >
            <AddIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
            <Typography color="textSecondary">
              Sin contenido. Comienza agregando bloques arriba.
            </Typography>
          </Paper>
        ) : (
          blocks.map((block, index) => (
            <Card
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(block.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(block.id)}
              onMouseEnter={() => setEditingBlock(block.id)}
              onMouseLeave={() => setEditingBlock(null)}
              sx={{
                p: 2,
                opacity: draggedId === block.id ? 0.5 : 1,
                cursor: draggedId ? 'grabbing' : 'grab',
                transition: 'all 0.2s',
                border: editingBlock === block.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                '&:hover': { 
                  boxShadow: 3,
                  bgcolor: '#fafafa',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <DragIcon sx={{ mt: 1, color: 'action.disabled', cursor: 'grab' }} />

                <Box sx={{ flex: 1 }}>
                  {/* Block Type Badge */}
                  <Box
                    sx={{
                      mb: 1.5,
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {block.type.toUpperCase()}
                  </Box>

                  {/* Block Content Editor */}
                  {block.type === 'heading' && (
                    <Stack spacing={1}>
                      <Select
                        value={String(block.level || 2)}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
                          })
                        }
                        size="small"
                        sx={{ maxWidth: 150 }}
                      >
                        <option value={1}>H1 - Muy grande</option>
                        <option value={2}>H2 - Grande</option>
                        <option value={3}>H3 - Mediano</option>
                        <option value={4}>H4 - Pequeño</option>
                        <option value={5}>H5 - Muy pequeño</option>
                        <option value={6}>H6 - Mínimo</option>
                      </Select>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Escribe el encabezado..."
                        value={block.content || ''}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: `${28 - (block.level || 2) * 3}px`,
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Stack>
                  )}

                  {block.type === 'paragraph' && (
                    <Stack spacing={1}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Escribe el párrafo..."
                        value={block.content || ''}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                      />
                      <ToggleButtonGroup
                        size="small"
                        value={[block.bold ? 'bold' : '', block.italic ? 'italic' : '', block.underline ? 'underline' : '']}
                        onChange={(_, newFormats) => {
                          updateBlock(block.id, {
                            bold: newFormats.includes('bold'),
                            italic: newFormats.includes('italic'),
                            underline: newFormats.includes('underline'),
                          });
                        }}
                      >
                        <ToggleButton value="bold"><BoldIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="italic"><ItalicIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="underline"><UnderlineIcon fontSize="small" /></ToggleButton>
                      </ToggleButtonGroup>
                      <ToggleButtonGroup
                        size="small"
                        value={block.align || 'left'}
                        onChange={(_, newAlign) => {
                          if (newAlign) {
                            updateBlock(block.id, { align: newAlign });
                          }
                        }}
                      >
                        <ToggleButton value="left"><AlignLeftIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="center"><AlignCenterIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="right"><AlignRightIcon fontSize="small" /></ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                  )}

                  {block.type === 'image' && (
                    <Stack spacing={1}>
                      {!block.imageMediaId ? (
                        <Button
                          variant="outlined"
                          onClick={() => openMediaPicker(block.id, 'image')}
                          sx={{ textTransform: 'none' }}
                        >
                          Seleccionar imagen
                        </Button>
                      ) : (
                        <>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: '#f5f5f5',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body2">
                              ✓ Imagen seleccionada (ID: {block.imageMediaId})
                            </Typography>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => openMediaPicker(block.id, 'image')}
                            >
                              Cambiar
                            </Button>
                          </Box>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Texto alternativo..."
                            value={block.imageAlt || ''}
                            onChange={(e) =>
                              updateBlock(block.id, { imageAlt: e.target.value })
                            }
                          />
                          {block.imageUrl && (
                            <Box
                              component="img"
                              src={block.imageUrl}
                              alt={block.imageAlt || 'Preview'}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: 250,
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                              }}
                            />
                          )}
                        </>
                      )}
                    </Stack>
                  )}

                  {block.type === 'video' && (
                    <Stack spacing={1}>
                      {!block.videoMediaId ? (
                        <Button
                          variant="outlined"
                          onClick={() => openMediaPicker(block.id, 'video')}
                          sx={{ textTransform: 'none' }}
                        >
                          Seleccionar vídeo
                        </Button>
                      ) : (
                        <>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: '#f5f5f5',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="body2">
                              ✓ Vídeo seleccionado (ID: {block.videoMediaId})
                            </Typography>
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => openMediaPicker(block.id, 'video')}
                            >
                              Cambiar
                            </Button>
                          </Box>
                          {block.videoUrl && (
                            <Box
                              sx={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                borderRadius: 1,
                              }}
                            >
                              <video
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                }}
                                controls
                                src={block.videoUrl}
                              />
                            </Box>
                          )}
                        </>
                      )}
                    </Stack>
                  )}

                  {block.type === 'quote' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Escribe la cita..."
                      value={block.content || ''}
                      onChange={(e) =>
                        updateBlock(block.id, { content: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderLeft: '4px solid #1976d2',
                          borderRadius: '4px 4px 4px 4px',
                          fontStyle: 'italic',
                        },
                      }}
                    />
                  )}

                  {block.type === 'list' && (
                    <Stack spacing={1}>
                      <Select
                        value={block.listType || 'unordered'}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            listType: e.target.value as 'ordered' | 'unordered',
                          })
                        }
                        size="small"
                      >
                        <option value="unordered">Lista sin orden (viñetas)</option>
                        <option value="ordered">Lista numerada</option>
                      </Select>
                      {(block.listItems || []).map((item, idx) => (
                        <Stack key={idx} direction="row" spacing={1}>
                          <Typography sx={{ pt: 1.2, color: 'textSecondary' }}>
                            {block.listType === 'ordered' ? `${idx + 1}.` : '•'}
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder={`Elemento ${idx + 1}...`}
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(block.listItems || [])];
                              newItems[idx] = e.target.value;
                              updateBlock(block.id, { listItems: newItems });
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newItems = block.listItems?.filter((_, i) => i !== idx) || [];
                              updateBlock(block.id, { listItems: newItems });
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ))}
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          const newItems = [...(block.listItems || []), ''];
                          updateBlock(block.id, { listItems: newItems });
                        }}
                      >
                        + Agregar elemento
                      </Button>
                    </Stack>
                  )}

                  {block.type === 'divider' && (
                    <Typography variant="body2" color="textSecondary" sx={{ py: 1 }}>
                      ─────────────────────────────────────
                    </Typography>
                  )}
                </Box>

                {/* Block Actions */}
                <Stack direction="column" spacing={0.5}>
                  <Tooltip title="Mover arriba">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUpIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Mover abajo">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                      >
                        <MoveDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Card>
          ))
        )}
      </Stack>

      {/* Media Picker Dialog */}
      <Dialog 
        open={mediaPickerOpen} 
        onClose={() => setMediaPickerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Seleccionar {mediaPickerType === 'image' ? 'imagen' : 'vídeo'}
        </DialogTitle>
        <DialogContent sx={{ minHeight: 400 }}>
          {/* Upload Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              O sube un {mediaPickerType === 'image' ? 'imagen' : 'vídeo'} nuevo
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <input
                type="file"
                id="media-upload"
                style={{ display: 'none' }}
                accept={mediaPickerType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleMediaUpload}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => document.getElementById('media-upload')?.click()}
                disabled={mediaLoading}
              >
                Subir {mediaPickerType === 'image' ? 'imagen' : 'vídeo'}
              </Button>
              {mediaLoading && (
                <Typography variant="caption">Subiendo...</Typography>
              )}
            </Box>
          </Box>

          {mediaLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {mediaError && (
            <Alert severity="error">{mediaError}</Alert>
          )}

          {!mediaLoading && !mediaError && mediaItems.length === 0 && (
            <Alert severity="info">
              No hay {mediaPickerType === 'image' ? 'imágenes' : 'vídeos'} disponibles
            </Alert>
          )}

          {!mediaLoading && mediaItems.length > 0 && (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' } }}>
              {mediaItems.map((media) => (
                <Box key={media.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    }}
                    onClick={() => selectMedia(media)}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {media.thumbnail_url || media.url ? (
                        mediaPickerType === 'video' ? (
                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            <video
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              src={media.url}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                borderRadius: '50%',
                                p: 1,
                              }}
                            >
                              <VideoIcon sx={{ color: (theme) => theme.palette.common.white, fontSize: 30 }} />
                            </Box>
                          </Box>
                        ) : (
                          <img
                            src={media.thumbnail_url ?? media.url}
                            alt={media.title ?? ''}
                            style={{
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )
                      ) : (
                        <Typography color="textSecondary">—</Typography>
                      )}
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {media.title ?? `#${media.id}`}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediaPickerOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockEditor;
