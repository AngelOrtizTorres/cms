"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import PeopleIcon from "@mui/icons-material/People";
import { useTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PublicIcon from "@mui/icons-material/Public";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NextLink from "next/link";

type NewsItem = {
  id: number;
  title?: string;
  status?: string;
  created_at?: string;
  section?: string;
  site_id?: number;
};
type SectionItem = { id: number; name?: string; site_id?: number };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [authorsCount, setAuthorsCount] = useState<number | null>(null);
  const [editorsCount, setEditorsCount] = useState<number | null>(null);
  const [websCount, setWebsCount] = useState<number | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [sectionsCount, setSectionsCount] = useState<number | null>(null);
  const theme = useTheme();
  const auth = useAuth();
  const isAdmin = auth.user?.role === "admin";

  const statColors = {
    users: theme.palette.primary.main,
    authors: theme.palette.secondary?.main || "#9c27b0",
    editors: theme.palette.warning?.main || "#ff9800",
    webs: theme.palette.info?.main || "#0288d1",
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const promises: Promise<unknown>[] = [
          apiGet("/sites"),
          apiGet("/news"),
          apiGet("/sections"),
        ];
        if (isAdmin) promises.unshift(apiGet("/users"));

        const results = await Promise.allSettled(promises);

        const asArray = (v: unknown) => {
          if (Array.isArray(v)) return v as any[];
          if (v && typeof v === "object" && Array.isArray((v as any)["data"]))
            return (v as any)["data"] as any[];
          return [] as any[];
        };

        let offset = 0;
        if (isAdmin) {
          const users = asArray(
            results[0].status === "fulfilled" ? results[0].value : [],
          );
          if (mounted) {
            setUsersCount(users.length);
            setAuthorsCount(
              users.filter(
                (u: any) => (u?.role || "").toLowerCase() === "author",
              ).length,
            );
            setEditorsCount(
              users.filter(
                (u: any) => (u?.role || "").toLowerCase() === "editor",
              ).length,
            );
          }
          offset = 1;
        }

        const sites = asArray(
          results[offset].status === "fulfilled"
            ? (results[offset] as PromiseFulfilledResult<unknown>).value
            : [],
        );
        const news = asArray(
          results[offset + 1].status === "fulfilled"
            ? (results[offset + 1] as PromiseFulfilledResult<unknown>).value
            : [],
        );
        const sections = asArray(
          results[offset + 2].status === "fulfilled"
            ? (results[offset + 2] as PromiseFulfilledResult<unknown>).value
            : [],
        );

        if (!mounted) return;
        setWebsCount(sites.length);
        setRecentNews(news.slice(0, 8));
        setSectionsCount(sections.length);
      } catch (e) {
        console.error("Error cargando estadísticas", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
        }}
      >
        {/* Left column */}
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Welcome */}
          <Paper
            sx={{ p: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}
            elevation={1}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Bienvenido, {auth.user?.name || "usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Paper>

          {/* Recent news */}
          <Paper sx={{ p: 2 }} elevation={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <ArticleIcon fontSize="small" color="primary" />
                Noticias recientes
              </Typography>
              {sectionsCount !== null && (
                <Chip
                  label={`${sectionsCount} sección${sectionsCount !== 1 ? "es" : ""}`}
                  size="small"
                  icon={<CategoryIcon />}
                />
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : recentNews.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                No hay noticias publicadas aún.
              </Typography>
            ) : (
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                {recentNews.map((item, idx) => (
                  <Box
                    key={item.id}
                    component="li"
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        idx < recentNews.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {item.title || `Noticia #${item.id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.created_at)}
                        {item.section && ` · ${item.section}`}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {item.status && (
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === "published" ? "success" : "default"
                          }
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right column */}
        <Box>
          <Box sx={{ display: "grid", gap: 2 }}>
            {loading ? (
              <Paper sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={20} />
              </Paper>
            ) : (
              <>
                {isAdmin && (
                  <>
                    <Paper
                      component={NextLink}
                      href="/dashboard/users"
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderLeft: `4px solid ${statColors.users}`,
                        textDecoration: "none",
                        cursor: "pointer",
                        "&:hover": { opacity: 0.88 },
                      }}
                      elevation={1}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PeopleIcon sx={{ color: statColors.users }} />
                        <Typography variant="body2">Usuarios</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {usersCount ?? "-"}
                      </Typography>
                    </Paper>

                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderLeft: `4px solid ${statColors.authors}`,
                      }}
                      elevation={1}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon sx={{ color: statColors.authors }} />
                        <Typography variant="body2">Autores</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {authorsCount ?? "-"}
                      </Typography>
                    </Paper>

                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderLeft: `4px solid ${statColors.editors}`,
                      }}
                      elevation={1}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SupervisorAccountIcon
                          sx={{ color: statColors.editors }}
                        />
                        <Typography variant="body2">Editores</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {editorsCount ?? "-"}
                      </Typography>
                    </Paper>
                  </>
                )}

                <Paper
                  component={NextLink}
                  href="/dashboard/webs"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeft: `4px solid ${statColors.webs}`,
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": { opacity: 0.88 },
                  }}
                  elevation={1}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PublicIcon sx={{ color: statColors.webs }} />
                    <Typography variant="body2">Webs</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {websCount ?? "-"}
                  </Typography>
                </Paper>
              </>
            )}

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Acciones rápidas
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box
                  component={NextLink}
                  href="/dashboard/webs"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "primary.main",
                    textDecoration: "none",
                    fontSize: 13,
                    py: 0.5,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                  Gestionar webs
                </Box>
                {isAdmin && (
                  <Box
                    component={NextLink}
                    href="/dashboard/users"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "primary.main",
                      textDecoration: "none",
                      fontSize: 13,
                      py: 0.5,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                    Gestionar usuarios
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
