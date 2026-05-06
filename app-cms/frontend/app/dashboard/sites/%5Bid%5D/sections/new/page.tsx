'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import BlockEditor, { ContentBlock } from '@/components/ArticleEditor/BlockEditor';
import BlockRenderer from '@/components/ArticleEditor/BlockRenderer';
import { apiPost } from '@/lib/api';

interface SectionFormData {
  name: string;
  slug: string;
  description: string;
  blocks: ContentBlock[];
  active: boolean;
}

export default function CreateSectionPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;

  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    slug: '',
    description: '',
    blocks: [],
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('El nombre de la sección es requerido');
      }

      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        content: formData.blocks.length > 0 ? JSON.stringify(formData.blocks) : null,
        active: formData.active,
        position: 0,
      };

      const response = await apiPost('/sections', payload);
      const data = response as unknown as Record<string, unknown>;

      if (data.id) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/sites/${siteId}/sections`);
        }, 1000);
      }
    } catch (err) {
      const error = err as Record<string, unknown>;
      setError((error.message as string) || 'Error al crear la sección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Crear nueva sección
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Define una nueva categoría para tu contenido
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✓ Sección creada exitosamente. Redirigiendo...
        </Alert>
      )}

      <Stack spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Editor */}
        <Box>
          <Card sx={{ p: 3 }}>
            <Stack
              component="form"
              onSubmit={handleSubmit}
              spacing={3}
              noValidate
            >
              {/* Name */}
              <TextField
                fullWidth
                label="Nombre de la sección"
                placeholder="Ej: Tecnología, Deportes, etc..."
                value={formData.name}
                onChange={handleNameChange}
                disabled={loading}
                required
              />

              {/* Slug */}
              <TextField
                fullWidth
                label="URL amigable (slug)"
                placeholder="url-amigable"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                disabled={loading}
                helperText="Se genera automáticamente desde el nombre"
              />

              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción breve"
                placeholder="Breve descripción de la sección..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={loading}
              />

              {/* Active */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    disabled={loading}
                  />
                }
                label="Sección activa"
              />

              {/* Block Editor */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Contenido (opcional)
                </Typography>
                <BlockEditor
                  blocks={formData.blocks}
                  onChange={(blocks) =>
                    setFormData((prev) => ({
                      ...prev,
                      blocks,
                    }))
                  }
                />
              </Box>

              {/* Submit */}
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Crear sección'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>

        {/* Preview */}
        <Box>
          <Card sx={{ p: 3, position: 'sticky', top: 20, maxHeight: 'calc(100vh - 40px)', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Vista previa
            </Typography>

            {formData.name && (
              <>
                <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
                  {formData.name}
                </Typography>
                {formData.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {formData.description}
                  </Typography>
                )}
              </>
            )}

            {formData.blocks.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <BlockRenderer blocks={formData.blocks} />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Agrega bloques para ver la vista previa
              </Typography>
            )}
          </Card>
        </Box>
      </Stack>
    </Container>
  );
}
