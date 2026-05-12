'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import BlockRenderer from '@/components/ArticleEditor/BlockRenderer';
import { ContentBlock } from '@/components/ArticleEditor/BlockEditor';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
  };
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Article>(`/articles/${slug}`);
        const articleData = data as unknown as Article;
        setArticle(articleData);

        // Parse content blocks
        if (articleData.content) {
          try {
            const parsedBlocks = JSON.parse(articleData.content);
            setBlocks(Array.isArray(parsedBlocks) ? parsedBlocks : []);
          } catch {
            setBlocks([]);
          }
        }
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

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Artículo no encontrado'}</Alert>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          ← Volver
        </Button>
      </Container>
    );
  }

  const publishDate = new Date(article.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          {article.title}
        </Typography>

        {article.excerpt && (
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 2,
              fontStyle: 'italic',
            }}
          >
            {article.excerpt}
          </Typography>
        )}

        {/* Article Meta */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, color: 'text.secondary' }}>
          <Typography variant="body2">
            📅 {publishDate}
          </Typography>
          {article.user && (
            <Typography variant="body2">
              ✍️ {article.user.name}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Featured Image */}
      {article.featured_image && (
        <Box
          component="img"
          src={article.featured_image}
          alt={article.title}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: 400,
            borderRadius: 2,
            mb: 4,
            boxShadow: 1,
          }}
        />
      )}

      {/* Content */}
      <Box
        sx={{
          typography: 'body1',
          lineHeight: 1.8,
          mb: 6,
          '& h1, & h2, & h3': {
            mt: 3,
            mb: 1.5,
          },
          '& h4, & h5, & h6': {
            mt: 2,
            mb: 1,
          },
          '& p': {
            mb: 2,
          },
        }}
      >
        <BlockRenderer blocks={blocks} />
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={2} sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={() => router.back()}>
          ← Volver
        </Button>
        <Button variant="contained" onClick={() => router.push(`/articles/${slug}/edit`)}>
          ✎ Editar
        </Button>
      </Stack>
    </Container>
  );
}
