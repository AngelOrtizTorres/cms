'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiDelete } from '@/lib/api';

interface Section {
  id: number;
  name: string;
  slug: string;
  description?: string;
  position: number;
  active: boolean;
  created_at: string;
}

export default function SectionsPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params?.id as string | undefined;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Section[]>('/sections');
        setSections(Array.isArray(data) ? (data as unknown as Section[]) : []);
      } catch (err) {
        console.error('Error fetching sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/sections/${id}`);
      setSections(sections.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Secciones/Categorías
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestiona las categorías de tu sitio
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => router.push(`/dashboard/sites/${siteId}/sections/new`)}
        >
          + Crear sección
        </Button>
      </Box>

      <Card>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : sections.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              Sin secciones. Crea tu primera categoría.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {section.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        /{section.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {section.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: section.active ? 'success.light' : 'error.light',
                          color: section.active ? 'success.main' : 'error.main',
                        }}
                      >
                        {section.active ? 'Activa' : 'Inactiva'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/dashboard/sites/${siteId}/sections/${section.id}/edit`)}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirm(section.id)}
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Eliminar sección</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta sección? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
