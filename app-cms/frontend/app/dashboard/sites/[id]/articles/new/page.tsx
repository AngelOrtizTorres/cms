"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import BlockEditor, {
  ContentBlock,
} from "@/components/ArticleEditor/BlockEditor";
import BlockRenderer from "@/components/ArticleEditor/BlockRenderer";
import { apiPost } from "@/lib/api";

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  blocks: ContentBlock[];
}

export default function CreateArticlePage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const siteId = params?.id;

  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    excerpt: "",
    blocks: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((p) => ({ ...p, title, slug: generateSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) throw new Error("El título es requerido");
      if (formData.blocks.length === 0)
        throw new Error("Agrega al menos un bloque de contenido");

      const payload = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: JSON.stringify(formData.blocks),
        site_id: siteId,
        status: "published",
        featured: false,
      };

      const response = await apiPost("/articles", payload);
      const data = response as unknown as Record<string, unknown>;

      if (data.id) {
        setSuccess(true);
        setTimeout(() => router.push(`/articles/${data.slug}`), 1000);
      }
    } catch (err) {
      const e = err as Record<string, unknown>;
      setError((e.message as string) || "Error al crear el artículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Crear nueva entrada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Usa bloques para crear tu contenido de forma flexible
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✓ Artículo creado exitosamente. Redirigiendo...
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Card sx={{ p: 3 }}>
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={3}
            noValidate
          >
            <TextField
              fullWidth
              label="Título"
              placeholder="Escribe el título..."
              value={formData.title}
              onChange={handleTitleChange}
              disabled={loading}
              required
            />
            <TextField
              fullWidth
              label="URL amigable (slug)"
              placeholder="url-amigable"
              value={formData.slug}
              onChange={(e) =>
                setFormData((p) => ({ ...p, slug: e.target.value }))
              }
              disabled={loading}
              helperText="Se genera automáticamente desde el título"
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Extracto/Resumen"
              placeholder="Breve descripción del artículo..."
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((p) => ({ ...p, excerpt: e.target.value }))
              }
              disabled={loading}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Contenido
              </Typography>
              <BlockEditor
                blocks={formData.blocks}
                onChange={(blocks) => setFormData((p) => ({ ...p, blocks }))}
              />
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || formData.blocks.length === 0}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={20} /> : "Publicar artículo"}
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

        <Card
          sx={{
            p: 3,
            position: "sticky",
            top: 20,
            maxHeight: "calc(100vh - 40px)",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Vista previa
          </Typography>
          {formData.title && (
            <>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                {formData.title}
              </Typography>
              {formData.excerpt && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Agrega bloques para ver la vista previa
            </Typography>
          )}
        </Card>
      </Box>
    </Container>
  );
}
