"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function EditSitePage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();

  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiGet(`/sites/${id}`);
        const s = res as unknown as Record<string, unknown>;
        setSite(s);
        setTitle(String(s['title'] ?? ''));
        setDomain(String(s['domain'] ?? ''));
        setStatus(String(s['status'] ?? 'active'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await apiPut(`/sites/${id}`, { title, domain, status });
      router.push("/dashboard/webs");
    } catch (err) {
      console.error("Error updating site", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container sx={{ py: 4 }}>Cargando...</Container>;
  if (!site) return <Container sx={{ py: 4 }}>Sitio no encontrado</Container>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }} elevation={2}>
        <Typography variant="h5" gutterBottom>Editar web</Typography>
        <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Dominio" value={domain} onChange={(e) => setDomain(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select value={status} label="Estado" onChange={(e) => setStatus(String((e.target as HTMLInputElement).value))}>
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
            <Button variant="outlined" onClick={() => router.back()}>Cancelar</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
