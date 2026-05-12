"use client";

import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
// Usamos `Box` con CSS grid para evitar problemas de tipos con `Grid` en TS
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PublicIcon from '@mui/icons-material/Public';
import CircularProgress from '@mui/material/CircularProgress';
import { apiGet } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [authorsCount, setAuthorsCount] = useState<number | null>(null);
  const [editorsCount, setEditorsCount] = useState<number | null>(null);
  const [websCount, setWebsCount] = useState<number | null>(null);
  const theme = useTheme();
  const statColors = {
    users: theme.palette.primary.main,
    authors: theme.palette.secondary?.main || '#9c27b0',
    editors: theme.palette.warning?.main || '#ff9800',
    webs: theme.palette.info?.main || '#0288d1',
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const usersResp = await apiGet('/users');
        const sitesResp = await apiGet('/sites');
        const asArray = (v: unknown) => {
          if (Array.isArray(v)) return v as any[];
          if (v && typeof v === 'object' && Array.isArray((v as Record<string, unknown>)['data'])) return (v as Record<string, unknown>)['data'] as any[];
          return [] as any[];
        };
        const users = asArray(usersResp);
        const sites = asArray(sitesResp);
        if (!mounted) return;
        setUsersCount(users.length);
        setAuthorsCount(users.filter((u:any) => (u?.role || '').toLowerCase() === 'author').length);
        setEditorsCount(users.filter((u:any) => (u?.role || '').toLowerCase() === 'editor').length);
        setWebsCount(sites.length);
      } catch (e) {
        console.error('Error cargando estadísticas', e);
        if (mounted) {
          setUsersCount(null);
          setAuthorsCount(null);
          setEditorsCount(null);
          setWebsCount(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }} elevation={1}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Mi sitio</Typography>
            </Paper>

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1" gutterBottom>Publicaciones recientes</Typography>
              <Typography variant="body2" color="text.secondary">Aquí iría una lista de artículos.</Typography>
            </Paper>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {loading ? (
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Paper>
            ) : (
              <>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${statColors.users}` }} elevation={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">Usuarios</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{usersCount ?? '-'}</Typography>
                </Paper>

                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${statColors.authors}` }} elevation={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">Autores</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{authorsCount ?? '-'}</Typography>
                </Paper>

                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${statColors.editors}` }} elevation={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupervisorAccountIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">Editores</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{editorsCount ?? '-'}</Typography>
                </Paper>

                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${statColors.webs}` }} elevation={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2">Webs</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{websCount ?? '-'}</Typography>
                </Paper>
              </>
            )}

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1">Actividad</Typography>
              <Typography variant="body2" color="text.secondary">Últimas acciones.</Typography>
            </Paper>

            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle1">Estado del sitio</Typography>
              <Typography variant="body2" color="text.secondary">Estado general.</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
