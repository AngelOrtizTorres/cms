"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/context/AuthContext";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  normalizeApiError,
} from "@/lib/api";

type Section = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  position?: number;
  active?: boolean;
};

export default function SectionsManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  // site: undefined = loading, null = not found, object = site
  const [site, setSite] = useState<Record<string, unknown> | null | undefined>(
    undefined,
  );
  const [siteLoading, setSiteLoading] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const url = siteId ? `/sites/${siteId}/sections` : "/sections";
      const res = await apiGet<Section[]>(url);
      const isRecord = (v: unknown): v is Record<string, unknown> =>
        typeof v === "object" && v !== null;
      const list: Section[] = Array.isArray(res)
        ? (res as unknown as Section[])
        : isRecord(res) &&
            Array.isArray((res as Record<string, unknown>)["data"])
          ? ((res as Record<string, unknown>)["data"] as unknown as Section[])
          : [];
      setSections(list);
    } catch (err: unknown) {
      const normalized = normalizeApiError(err);
      console.error("Error fetching sections", normalized);
      setSections([]);
      setError(normalized.message || "Error al cargar secciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchSections();
    };
    load();
  }, [siteId]);

  useEffect(() => {
    if (!siteId) {
      setSite(null);
      setSiteLoading(false);
      return;
    }

    const load = async () => {
      setSiteLoading(true);
      try {
        const s = await apiGet(`/sites/${siteId}`);
        setSite(s as unknown as Record<string, unknown>);
      } catch {
        setSite(null);
      } finally {
        setSiteLoading(false);
      }
    };
    load();
  }, [siteId]);

  const router = useRouter();
  useEffect(() => {
    if (auth.loading) return;
    if (!siteId) return;
    if (siteLoading) return;
    if (site === null) {
      router.push("/dashboard/webs");
      return;
    }
    const isSiteOwner = !!(
      auth.user &&
      site &&
      Number((site as Record<string, unknown>).owner_id) ===
        Number(auth.user.id)
    );
    const allowed =
      auth.user?.role === "admin" ||
      (auth.user?.role === "author" && isSiteOwner);
    if (!allowed) router.push("/dashboard/webs");
  }, [siteLoading, site, auth.user, auth.loading, router, siteId]);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, [editingId]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setEditingId(null);
  };

  const startEdit = (s: Section) => {
    setEditingId(s.id);
    setName(s.name || "");
    setSlug(s.slug || "");
    setDescription(s.description || "");
  };

  const goToEditContent = (sectionId: number) => {
    router.push(`/dashboard/sites/${siteId}/sections/${sectionId}/edit`);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) return setError("Nombre requerido");
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name,
        slug: slug || undefined,
        description,
      };
      if (editingId) {
        await apiPut(`/sections/${editingId}`, payload);
        setSuccess("Sección actualizada");
      } else {
        const url = siteId ? `/sites/${siteId}/sections` : "/sections";
        await apiPost(url, payload);
        setSuccess("Sección creada");
      }
      resetForm();
      await fetchSections();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as Record<string, unknown>)["message"])
          : "Error al guardar la sección";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta sección?")) return;
    try {
      await apiDelete(`/sections/${id}`);
      setSuccess("Sección eliminada");
      await fetchSections();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as Record<string, unknown>)["message"])
          : "Error al eliminar";
      setError(msg);
    }
  };

  const filtered = sections.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.slug || "").toLowerCase().includes(q)
    );
  });

  const isSiteOwner = !!(
    auth.user &&
    site &&
    Number(site.owner_id) === Number(auth.user.id)
  );
  const canManage =
    auth.user?.role === "admin" ||
    (auth.user?.role === "author" && isSiteOwner);
  // Only the author who is the site owner can reorder (admin cannot, per README spec)
  const canReorder = auth.user?.role === "author" && isSiteOwner;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === Number(active.id));
    const newIndex = sections.findIndex((s) => s.id === Number(over.id));
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    try {
      const url = siteId
        ? `/sites/${siteId}/sections/reorder`
        : `/sections/reorder`;
      await apiPut(url, {
        items: reordered.map((s, idx) => ({ id: s.id, position: idx })),
      });
    } catch (err) {
      console.error("Error reordering sections", err);
      await fetchSections(); // Restore on error
    }
  };

  if (auth.loading)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        Cargando...
      </Container>
    );
  if (siteLoading && siteId)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        Cargando...
      </Container>
    );
  if (!siteLoading && siteId && !canManage && !auth.loading) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Secciones
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            {editingId ? "Editar sección" : "Añadir sección"}
          </Typography>
          {siteLoading ? (
            <Box sx={{ p: 2 }}>Cargando...</Box>
          ) : !canManage ? null : (
            <Box
              component="form"
              onSubmit={handleSave}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                inputRef={nameRef}
                label="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Slug (opcional)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={3}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                {editingId && (
                  <Button variant="outlined" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
                <Button variant="contained" type="submit" disabled={saving}>
                  {saving
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar"
                      : "Añadir"}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">Listado</Typography>
            <style>{`#sections-filters .MuiInputBase-input::placeholder, #sections-filters .MuiFilledInput-input::placeholder { color: rgba(0,0,0,0.45) !important; opacity: 1 !important; }`}</style>
            <Box id="sections-filters" sx={{ display: "flex", gap: 1 }}>
              <TextField
                placeholder="Buscar"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                size="small"
              />
              <Button variant="outlined" onClick={() => setFilter("")}>
                Limpiar
              </Button>
            </Box>
          </Box>

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>Cargando...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>No hay secciones</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.slug}</TableCell>
                        <TableCell>{s.description || "—"}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => startEdit(s)}
                            sx={{ mr: 1 }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            onClick={() => goToEditContent(s.id)}
                            sx={{ mr: 1 }}
                          >
                            Contenido
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(s.id)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}
