'use client';

import React, { useState, useCallback } from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'list' | 'divider';
  content?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  imageUrl?: string;
  imageAlt?: string;
  listItems?: string[];
  listType?: 'ordered' | 'unordered';
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      listItems: type === 'list' ? [''] : undefined,
      listType: 'unordered',
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
    <Stack spacing={3}>
      {/* Block Type Selector */}
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Agregar bloque
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('heading')}
          >
            + Encabezado
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('paragraph')}
          >
            + Párrafo
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('image')}
          >
            + Imagen
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('quote')}
          >
            + Cita
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('list')}
          >
            + Lista
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => addBlock('divider')}
          >
            + Separador
          </Button>
        </Stack>
      </Paper>

      {/* Blocks List */}
      <Stack spacing={2}>
        {blocks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography color="textSecondary">
              Sin bloques. Comienza agregando contenido.
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
              sx={{
                p: 2,
                opacity: draggedId === block.id ? 0.5 : 1,
                cursor: draggedId ? 'grabbing' : 'grab',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <DragIcon sx={{ mt: 1, color: 'action.disabled' }} />

                <Box sx={{ flex: 1 }}>
                  {/* Block Type Selector */}
                  <Select
                    value={block.type}
                    onChange={(e) =>
                      updateBlock(block.id, { type: e.target.value as ContentBlock['type'] })
                    }
                    size="small"
                    sx={{ mb: 1.5, minWidth: 120 }}
                  >
                    <option value="heading">Encabezado</option>
                    <option value="paragraph">Párrafo</option>
                    <option value="image">Imagen</option>
                    <option value="quote">Cita</option>
                    <option value="list">Lista</option>
                    <option value="divider">Separador</option>
                  </Select>

                  {/* Heading Config */}
                  {block.type === 'heading' && (
                    <Stack spacing={1}>
                      <Select
                        value={block.level || 2}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
                          })
                        }
                        size="small"
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
                      />
                    </Stack>
                  )}

                  {/* Paragraph */}
                  {block.type === 'paragraph' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Escribe el párrafo..."
                      value={block.content || ''}
                      onChange={(e) =>
                        updateBlock(block.id, { content: e.target.value })
                      }
                    />
                  )}

                  {/* Image */}
                  {block.type === 'image' && (
                    <Stack spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="URL de la imagen..."
                        value={block.imageUrl || ''}
                        onChange={(e) =>
                          updateBlock(block.id, { imageUrl: e.target.value })
                        }
                      />
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
                            maxHeight: 200,
                            borderRadius: 1,
                            mt: 1,
                          }}
                        />
                      )}
                    </Stack>
                  )}

                  {/* Quote */}
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
                    />
                  )}

                  {/* List */}
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
                        <option value="unordered">Lista sin orden</option>
                        <option value="ordered">Lista numerada</option>
                      </Select>
                      {(block.listItems || []).map((item, idx) => (
                        <TextField
                          key={idx}
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

                  {/* Divider - no content needed */}
                  {block.type === 'divider' && (
                    <Typography variant="body2" color="textSecondary">
                      Separador horizontal
                    </Typography>
                  )}
                </Box>

                {/* Actions */}
                <Stack direction="column" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                  >
                    ▲
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    ▼
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteBlock(block.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default BlockEditor;
export type { ContentBlock };
