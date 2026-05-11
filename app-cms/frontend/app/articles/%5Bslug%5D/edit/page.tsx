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
  Paper,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import BlockEditor, { ContentBlock } from '@/components/ArticleEditor/BlockEditor';
import BlockRenderer from '@/components/ArticleEditor/BlockRenderer';
import { apiGet, apiPut } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    blocks: [] as ContentBlock[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Article>(`/articles/${slug}`);
        const articleData = data as unknown as Article;
        setArticle(articleData);

        // Parse blocks
        let blocks: ContentBlock[] = [];
        if (articleData.content) {
          try {
            const parsed = JSON.parse(articleData.content);
            blocks = Array.isArray(parsed) ? parsed : [];
          } catch {
            blocks = [];
          }
        }

        setFormData({
          title: articleData.title,
          slug: articleData.slug,
          excerpt: articleData.excerpt,
          blocks,
        });
      } catch (err) {
        const error = err as Record<string, unknown>;
        setError((error.message as string) || 'Error al cargar el artículo');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }

      if (formData.blocks.length === 0) {
        throw new Error('Agrega al menos un bloque de contenido');
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: JSON.stringify(formData.blocks),
      };

      await apiPut(`/articles/${article?.id}`, payload);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/articles/${formData.slug}`);
      }, 1000);
    } catch (err) {
      const error = err as Record<string, unknown>;
      setError((error.message as string) || 'Error al actualizar el artículo');
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

  if (!article) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Artículo no encontrado</Alert>
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
          Editar: {formData.title || 'Sin título'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Modifica el contenido de tu artículo
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✓ Artículo actualizado exitosamente. Redirigiendo...
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
              {/* Title */}
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={handleTitleChange}
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

              {/* Excerpt */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Extracto/Resumen"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    excerpt: e.target.value,
                  }))
                }
                disabled={saving}
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

            {formData.title && (
              <>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                  {formData.title}
                </Typography>
                {formData.excerpt && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {formData.excerpt}
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
