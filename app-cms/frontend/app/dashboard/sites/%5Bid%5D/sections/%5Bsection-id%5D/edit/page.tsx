'use client';

import React, { useState, useEffect } from 'react';
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
import { useParams, useRouter } from 'next/navigation';
import BlockEditor, { ContentBlock } from '@/components/ArticleEditor/BlockEditor';
import BlockRenderer from '@/components/ArticleEditor/BlockRenderer';
import { apiGet, apiPut } from '@/lib/api';

interface Section {
  id: number;
  name: string;
  slug: string;
  description: string;
  content?: string;
  active: boolean;
}

export default function EditSectionPage() {
  const params = useParams();
  const router = useRouter();
  const sectionId = params?.['section-id'] as string | undefined;
  const siteId = params?.id as string | undefined;

  const [section, setSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    blocks: [] as ContentBlock[],
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Section>(`/sections/${sectionId}`);
        const sectionData = data as unknown as Section;
        setSection(sectionData);

        // Parse blocks
        let blocks: ContentBlock[] = [];
        if (sectionData.content) {
          try {
            const parsed = JSON.parse(sectionData.content);
            blocks = Array.isArray(parsed) ? parsed : [];
          } catch {
            blocks = [];
          }
        }

        setFormData({
          name: sectionData.name,
          slug: sectionData.slug,
          description: sectionData.description,
          blocks,
          active: sectionData.active,
        });
      } catch (err) {
        const error = err as Record<string, unknown>;
        setError((error.message as string) || 'Error al cargar la sección');
      } finally {
        setLoading(false);
      }
    };

    if (sectionId) {
      fetchSection();
    }
  }, [sectionId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        content: formData.blocks.length > 0 ? JSON.stringify(formData.blocks) : null,
        active: formData.active,
      };

      await apiPut(`/sections/${section?.id}`, payload);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/sites/${siteId}/sections`);
      }, 1000);
    } catch (err) {
      const error = err as Record<string, unknown>;
      setError((error.message as string) || 'Error al actualizar la sección');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!section) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Sección no encontrada</Alert>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          ← Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Editar: {formData.name || 'Sin nombre'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Modifica los detalles de la sección
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✓ Sección actualizada exitosamente. Redirigiendo...
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
                value={formData.name}
                onChange={handleNameChange}
                disabled={saving}
                required
              />

              {/* Slug */}
              <TextField
                fullWidth
                label="URL amigable (slug)"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                disabled={saving}
              />

              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción breve"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={saving}
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
                    disabled={saving}
                  />
                }
                label="Sección activa"
              />

              {/* Block Editor */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Contenido
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
                  disabled={saving}
                  sx={{ minWidth: 150 }}
                >
                  {saving ? <CircularProgress size={20} /> : 'Guardar cambios'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  disabled={saving}
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
                Sin contenido
              </Typography>
            )}
          </Card>
        </Box>
      </Stack>
    </Container>
  );
}
