"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import ArticleIcon from "@mui/icons-material/Article";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";

type Article = {
  id: number;
  title?: string;
  status?: string;
  created_at?: string;
  slug?: string;
};

export default function SiteArticlesPage() {
  const params = useParams() as { id: string };
  const siteId = params?.id;
  const auth = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated && !auth.loading) {
      router.push("/login");
      return;
    }
    if (!siteId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/articles?site_id=${siteId}`);
        const list = Array.isArray(res)
          ? (res as unknown as Article[])
          : Array.isArray((res as any)?.data)
            ? ((res as any).data as Article[])
            : [];
        setArticles(list);
      } catch (err: any) {
        setError(err?.message || "Error al cargar artículos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [siteId, auth.isAuthenticated, auth.loading, router]);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ArticleIcon color="primary" />
          Artículos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small">
          Nuevo artículo
        </Button>
      </Box>
      <Paper elevation={1}>
        <Divider />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 3 }}>
            {error}
          </Typography>
        ) : articles.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              No hay artículos para este sitio todavía.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              sx={{ mt: 1 }}
            >
              Crear el primero
            </Button>
          </Box>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {articles.map((article, idx) => (
              <Box
                key={article.id}
                component="li"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderBottom:
                    idx < articles.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {article.title || `Artículo #${article.id}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {article.status}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
