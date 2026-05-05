"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function UsersManager({ siteId }: { siteId?: string }) {
  const auth = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filterName, setFilterName] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "author" | "editor">("all");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("author");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("author");

  const createNameRef = useRef<HTMLInputElement | null>(null);
  const editNameRef = useRef<HTMLInputElement | null>(null);

  // Delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: any = null;
      if (auth.sessionVerified) {
        res = await apiGet("/users");
      } else {
        const token = getStoredToken();
        if (!token) {
          setUsers([]);
          setError("No autenticado");
          return;
        }
        res = await apiGet("/users", token);
      }
      const list = Array.isArray(res) ? res : res.data ?? [];
      setUsers(list as User[]);
    } catch (err: any) {
      console.error("Error fetching users", err);
      setError(err?.message || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.user?.role !== "admin") {
      setUsers([]);
      setError(null);
      return;
    }
    fetchUsers();
  }, [auth.user?.role, auth.sessionVerified]);

  useEffect(() => {
    if (showCreate) setTimeout(() => createNameRef.current?.focus(), 30);
  }, [showCreate]);
  useEffect(() => {
    if (showEdit) setTimeout(() => editNameRef.current?.focus(), 30);
  }, [showEdit]);

  const filtered = users.filter((u) => {
    const nameMatch = !filterName || (u.name || "").toLowerCase().includes(filterName.toLowerCase());
    const roleMatch = filterRole === "all" || (u.role || "").toLowerCase() === filterRole;
    return nameMatch && roleMatch;
  });

  const openCreate = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("author");
    setShowCreate(true);
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName || !newEmail || !newPassword) return setError("Rellena nombre, email y contraseña");
    setCreating(true);
    try {
      await apiPost("/users", { name: newName, email: newEmail, password: newPassword, role: newRole });
      setSuccess("Usuario creado");
      setShowCreate(false);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error creando usuario");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditRole(u.role || "author");
    setEditPassword("");
    setShowEdit(true);
  };

  const handleSaveEdit = async (id: number) => {
    setUpdatingId(id);
    try {
      const payload: any = { name: editName, email: editEmail, role: editRole };
      if (editPassword) payload.password = editPassword;
      await apiPut(`/users/${id}`, payload);
      setSuccess("Usuario actualizado");
      setShowEdit(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error actualizando usuario");
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmTargetId) return setConfirmOpen(false);
    setConfirmOpen(false);
    try {
      await apiDelete(`/users/${confirmTargetId}`);
      setSuccess("Usuario eliminado");
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error eliminando usuario");
    } finally {
      setConfirmTargetId(null);
    }
  };

  if (auth.user?.role !== "admin") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Usuarios</Typography>
        <Alert severity="warning">Debes iniciar sesión como administrador para ver y gestionar usuarios.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Usuarios</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Buscar por nombre" value={filterName} onChange={(e) => setFilterName(e.target.value)} sx={{ minWidth: 220 }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filtrar por rol</InputLabel>
            <Select value={filterRole} label="Filtrar por rol" onChange={(e) => setFilterRole(e.target.value as any)}>
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={() => { setFilterName(""); setFilterRole("all"); }}>Limpiar</Button>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Button variant="contained" onClick={openCreate}>Crear usuario</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No hay usuarios</TableCell></TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEdit(u)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => openDeleteConfirm(u.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} fullWidth maxWidth="sm" aria-labelledby="create-user-title">
        <DialogTitle id="create-user-title">Crear usuario</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField inputRef={createNameRef} label="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth autoFocus />
            <TextField label="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} fullWidth />
            <TextField label="Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
            <FormControl>
              <InputLabel>Rol</InputLabel>
              <Select value={newRole} label="Rol" onChange={(e) => setNewRole(e.target.value)}>
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="author">author</MenuItem>
                <MenuItem value="editor">editor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>{creating ? 'Creando...' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)} fullWidth maxWidth="sm" aria-labelledby="edit-user-title">
        <DialogTitle id="edit-user-title">Editar usuario</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField inputRef={editNameRef} label="Nombre" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth />
            <TextField label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} fullWidth />
            <TextField label="Contraseña (dejar vacío para no cambiar)" type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} fullWidth />
            <FormControl>
              <InputLabel>Rol</InputLabel>
              <Select value={editRole} label="Rol" onChange={(e) => setEditRole(e.target.value)}>
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="author">author</MenuItem>
                <MenuItem value="editor">editor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEdit(false)}>Cancelar</Button>
          <Button onClick={() => editingUser && handleSaveEdit(editingUser.id)} variant="contained" disabled={updatingId !== null}>{updatingId !== null ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="confirm-delete-title">
        <DialogTitle id="confirm-delete-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Eliminar este usuario? Esta acción es irreversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
