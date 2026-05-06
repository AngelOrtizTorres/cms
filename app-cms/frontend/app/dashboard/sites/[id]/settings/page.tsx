"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import Alert from "@mui/material/Alert";
import FormHelperText from "@mui/material/FormHelperText";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import { apiGet, apiPut, apiPostFormData, normalizeApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Site = {
  id: number;
  title?: string | null;
  owner_id?: number | null;
};

export default function SiteSettingsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();
  const [site, setSite] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state (declarado incondicionalmente para mantener orden de hooks)
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [homeUrl, setHomeUrl] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [defaultRole, setDefaultRole] = useState("subscriber");
  const [language, setLanguage] = useState("es");
  const [timezone, setTimezone] = useState("Europe/Madrid");
  const [dateFormat, setDateFormat] = useState("d F Y");
  const [timeFormat, setTimeFormat] = useState("H:i");
  const [weekStart, setWeekStart] = useState("1");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [snackOpen, setSnackOpen] = useState(false);

  const loadSite = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await apiGet(`/sites/${id}`);
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const resolved = isRecord(s) && 'data' in s ? (s as any).data as Record<string, any> : s as Record<string, any>;
      setSite(resolved);
    } catch (e) {
      setError(normalizeApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  useEffect(() => {
    if (site) {
      setTitle(String(site.title ?? ""));
      setShortDescription(String(site.short_description ?? site.description ?? ""));
      setIconPreview((site.icon_url ?? site.iconUrl) as string ?? null);
      setSiteUrl(String(site.site_url ?? site.url ?? ""));
      setHomeUrl(String(site.home_url ?? site.homeUrl ?? ""));
      setAdminEmail(String(site.admin_email ?? site.adminEmail ?? ""));
      setAllowRegistration(Boolean(site.allow_registration ?? site.membership ?? false));
      setDefaultRole(String(site.default_role ?? "subscriber"));
      setLanguage(String(site.language ?? site.locale ?? "es"));
      setTimezone(String(site.timezone ?? "Europe/Madrid"));
      setDateFormat(String(site.date_format ?? "d F Y"));
      setTimeFormat(String(site.time_format ?? "H:i"));
      setWeekStart(String(site.week_start ?? "1"));
      setFieldErrors({});
      setSuccess(null);
    }
  }, [site]);

  // Redirigir silenciosamente si no tiene permisos de gestión
  // Declarado incondicionalmente para mantener el orden de hooks
  useEffect(() => {
    if (loading) return;
    if (!site) return;
    const allowed = auth.user?.role === 'admin' || Number(site.owner_id) === Number(auth.user?.id);
    if (!allowed) router.push('/dashboard/webs');
  }, [site, auth.user, router, loading]);

  const validate = (): boolean => {
    const errors: Record<string, string | null> = {};
    if (!title.trim()) errors.title = 'El título es obligatorio';
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) errors.adminEmail = 'Email inválido';
    const isUrl = (v: string) => {
      if (!v) return true;
      try { new URL(v); return true; } catch { return false; }
    };
    if (!isUrl(siteUrl)) errors.siteUrl = 'URL inválida';
    if (!isUrl(homeUrl)) errors.homeUrl = 'URL inválida';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setIconFile(null);
      return;
    }
    const file = e.target.files[0];
    setIconFile(file);
    const reader = new FileReader();
    reader.onload = () => setIconPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (iconFile) {
        const form = new FormData();
        form.append("title", title);
        form.append("short_description", shortDescription);
        form.append("site_url", siteUrl);
        form.append("home_url", homeUrl);
        form.append("admin_email", adminEmail);
        form.append("allow_registration", allowRegistration ? '1' : '0');
        form.append("default_role", defaultRole);
        form.append("language", language);
        form.append("timezone", timezone);
        form.append("date_format", dateFormat);
        form.append("time_format", timeFormat);
        form.append("week_start", weekStart);
        form.append("icon", iconFile);
        await apiPostFormData(`/sites/${id}`, form);
      } else {
        const body = {
          title,
          short_description: shortDescription,
          site_url: siteUrl,
          home_url: homeUrl,
          admin_email: adminEmail,
          allow_registration: allowRegistration ? 1 : 0,
          default_role: defaultRole,
          language,
          timezone,
          date_format: dateFormat,
          time_format: timeFormat,
          week_start: weekStart,
        };
        await apiPut(`/sites/${id}`, body);
      }
      setSuccess("Ajustes guardados correctamente");
      setSnackOpen(true);
      await loadSite();
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      if (normalized.errors && typeof normalized.errors === 'object') {
        const map: Record<string, string> = {};
        for (const k of Object.keys(normalized.errors as Record<string, any>)) {
          const v = (normalized.errors as Record<string, any>)[k];
          map[k] = Array.isArray(v) ? String(v[0]) : String(v);
        }
        setFieldErrors(prev => ({ ...prev, ...map }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!site) return;
    setTitle(String(site.title ?? ""));
    setShortDescription(String(site.short_description ?? site.description ?? ""));
    setIconPreview((site.icon_url ?? site.iconUrl) as string ?? null);
    setSiteUrl(String(site.site_url ?? site.url ?? ""));
    setHomeUrl(String(site.home_url ?? site.homeUrl ?? ""));
    setAdminEmail(String(site.admin_email ?? site.adminEmail ?? ""));
    setAllowRegistration(Boolean(site.allow_registration ?? site.membership ?? false));
    setDefaultRole(String(site.default_role ?? "subscriber"));
    setLanguage(String(site.language ?? site.locale ?? "es"));
    setTimezone(String(site.timezone ?? "Europe/Madrid"));
    setDateFormat(String(site.date_format ?? "d F Y"));
    setTimeFormat(String(site.time_format ?? "H:i"));
    setWeekStart(String(site.week_start ?? "1"));
    setFieldErrors({});
  };

  if (loading) return <Container id="site-settings" sx={{ py: 4 }}>Cargando...</Container>;
  if (error) return <Container id="site-settings" sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  if (!site) return <Container id="site-settings" sx={{ py: 4 }}>Site not found</Container>;

  return (
    <Container id="site-settings" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom>Ajustes generales</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Configura los valores principales de la web. Los cambios se guardan en el backend.</Typography>

        <Box component="form" onSubmit={handleSave}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            <Box>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Título del sitio"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      fullWidth
                      size="small"
                      error={!!fieldErrors.title}
                      helperText={fieldErrors.title ?? 'Nombre público de la web'}
                    />

                    <TextField
                      label="Descripción corta"
                      value={shortDescription}
                      onChange={e => setShortDescription(e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                    />

                    <Divider />

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar src={iconPreview ?? undefined} sx={{ width: 80, height: 80, bgcolor: '#e0e0e0' }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
                            Elegir icono
                            <input hidden accept="image/*" type="file" onChange={handleIconChange} />
                          </Button>
                          <Tooltip title="Eliminar icono">
                            <IconButton onClick={handleRemoveIcon} aria-label="eliminar icono"><DeleteIcon /></IconButton>
                          </Tooltip>
                        </Box>
                        <FormHelperText>Recomendado: cuadrado, 512×512px mínimo</FormHelperText>
                      </Box>
                    </Box>

                    <Divider />

                    <TextField
                      label="Dirección de WordPress (URL)"
                      value={siteUrl}
                      onChange={e => setSiteUrl(e.target.value)}
                      fullWidth
                      size="small"
                      error={!!fieldErrors.siteUrl}
                      helperText={fieldErrors.siteUrl ?? 'Ej: https://midominio.local'}
                    />

                    <TextField
                      label="Dirección del sitio (URL)"
                      value={homeUrl}
                      onChange={e => setHomeUrl(e.target.value)}
                      fullWidth
                      size="small"
                      error={!!fieldErrors.homeUrl}
                      helperText={fieldErrors.homeUrl ?? ''}
                    />

                    <TextField
                      label="Email de administración"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      fullWidth
                      size="small"
                      error={!!fieldErrors.adminEmail}
                      helperText={fieldErrors.adminEmail ?? 'Correo para notificaciones administrativas'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Vista previa</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Avatar src={iconPreview ?? undefined} sx={{ width: 56, height: 56 }} />
                      <Box>
                        <Typography variant="subtitle2">{title || 'Sin título'}</Typography>
                        <Typography variant="caption" color="text.secondary">{siteUrl || 'URL no definida'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Ajustes rápidos</Typography>
                    <Box sx={{ mt: 1 }}>
                      <FormControlLabel control={<Switch checked={allowRegistration} onChange={(e) => setAllowRegistration(e.target.checked)} />} label="Permitir registro" />
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel id="default-role-label">Perfil por defecto</InputLabel>
                        <Select labelId="default-role-label" value={defaultRole} label="Perfil por defecto" onChange={(e) => setDefaultRole(String(e.target.value))}>
                          <MenuItem value="subscriber">Suscriptor</MenuItem>
                          <MenuItem value="author">Autor</MenuItem>
                          <MenuItem value="editor">Editor</MenuItem>
                          <MenuItem value="admin">Administrador</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel id="language-label">Idioma</InputLabel>
                        <Select labelId="language-label" value={language} label="Idioma" onChange={(e) => setLanguage(String(e.target.value))}>
                          <MenuItem value="es">Español</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel id="timezone-label">Zona horaria</InputLabel>
                        <Select labelId="timezone-label" value={timezone} label="Zona horaria" onChange={(e) => setTimezone(String(e.target.value))}>
                          <MenuItem value="Europe/Madrid">Madrid</MenuItem>
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="America/New_York">America/New_York</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Formato de fecha y hora</Typography>
                    <Box sx={{ mt: 1 }}>
                      <FormLabel>Formato de fecha</FormLabel>
                      <RadioGroup value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                        <FormControlLabel value="d F Y" control={<Radio />} label="6 de mayo de 2026" />
                        <FormControlLabel value="Y-m-d" control={<Radio />} label="2026-05-06" />
                        <FormControlLabel value="d/m/Y" control={<Radio />} label="05/06/2026" />
                      </RadioGroup>

                      <FormLabel sx={{ mt: 1 }}>Formato de hora</FormLabel>
                      <RadioGroup value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)}>
                        <FormControlLabel value="H:i" control={<Radio />} label="11:55" />
                        <FormControlLabel value="g:i A" control={<Radio />} label="11:55 AM" />
                      </RadioGroup>

                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel id="weekstart-label">La semana comienza el</InputLabel>
                        <Select labelId="weekstart-label" value={weekStart} label="La semana comienza el" onChange={(e) => setWeekStart(String(e.target.value))}>
                          <MenuItem value="1">Lunes</MenuItem>
                          <MenuItem value="0">Domingo</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button variant="outlined" onClick={handleReset} disabled={saving}>Restaurar valores</Button>
            <Box>
              <Button sx={{ mr: 2 }} onClick={() => router.push(`/dashboard/sites/${id}`)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
            </Box>
          </Box>
        </Box>

        <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} message={success ?? 'Guardado'} action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        } />
      </Paper>
    </Container>
  );
}
