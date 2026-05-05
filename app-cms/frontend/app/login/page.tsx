"use client";

import React, { useState, useRef } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from '@/lib/api';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Validación cliente mínima
    let valid = true;
    if (!email) { setEmailError('Correo requerido'); valid = false; } else if (!/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Correo inválido'); valid = false; } else { setEmailError(null); }
    if (!password) { setPasswordError('Contraseña requerida'); valid = false; } else { setPasswordError(null); }
    if (!valid) {
      // foco en el primer campo inválido
      if (!email) { emailRef.current?.focus(); }
      else if (!password) { passwordRef.current?.focus(); }
      setLoading(false);
      return;
    }
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      // Normalizar errores del servidor para mostrar mensajes legibles
      try {
        // reset field errors first
        setEmailError(null);
        setPasswordError(null);

        if (err instanceof Error) {
          setError(err.message);
        } else if (err && typeof err === 'object') {
          const e: any = err;

          // Si el backend devolvió un texto JSON en `message`, intentar parsearlo
          if (typeof e.message === 'string') {
            try {
              const parsed = JSON.parse(e.message);
              if (parsed && parsed.errors) {
                if (parsed.errors.email) setEmailError(Array.isArray(parsed.errors.email) ? parsed.errors.email.join(' ') : String(parsed.errors.email));
                if (parsed.errors.password) setPasswordError(Array.isArray(parsed.errors.password) ? parsed.errors.password.join(' ') : String(parsed.errors.password));
                setError(parsed.message || Object.values(parsed.errors).flat().join(' '));
              } else if (parsed && parsed.message) {
                setError(parsed.message);
              } else {
                setError(e.message);
              }
            } catch {
              // message no es JSON
              setError(e.message || 'Credenciales inválidas');
            }
          } else if (e.errors) {
            // Forma: { errors: { field: [msg] }, message: '...' }
            if (e.errors.email) setEmailError(Array.isArray(e.errors.email) ? e.errors.email.join(' ') : String(e.errors.email));
            if (e.errors.password) setPasswordError(Array.isArray(e.errors.password) ? e.errors.password.join(' ') : String(e.errors.password));
            setError(e.message || Object.values(e.errors).flat().join(' '));
          } else if (e.status && e.message) {
            setError(String(e.message));
          } else {
            setError('Credenciales inválidas');
          }
        } else {
          setError(String(err ?? 'Credenciales inválidas'));
        }
      } catch (ex) {
        setError('Error en el login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Comprobar si ya existe administrador para ocultar CTA de registro
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiGet('/admin-exists');
        if (!mounted) return;
        setAdminExists(Boolean(res?.admin_exists));
      } catch (e) {
        // En caso de error, dejamos visible el botón para compatibilidad
        console.error('No se pudo comprobar admin-exists', e);
        if (mounted) setAdminExists(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#0f1720 0%, #0b0f12 100%)',
        py: 8,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 2,
          minWidth: 360,
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 10px 30px rgba(2,6,23,0.6)',
          bgcolor: 'rgba(10,12,15,0.92)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#ffffff',
          // force readable colors for form controls inside the login panel
          '& .MuiTypography-root': { color: '#ffffff' },
          '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.8)' },
          '& .MuiInputBase-input': { color: '#ffffff' },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.72)' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' },
          '& .MuiLink-root': { color: 'rgba(255,255,255,0.9)' },
          '& .MuiFormControlLabel-label': { color: 'rgba(255,255,255,0.9)' },
          '& input::placeholder, textarea::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 1 },
          '& .MuiCheckbox-root': { color: 'rgba(255,255,255,0.9)' },
          '& .MuiCheckbox-root.Mui-checked': { color: 'primary.main' },
          '& .MuiCheckbox-root svg': { color: 'rgba(255,255,255,0.9)', fill: 'currentColor' },
          '& .MuiCheckbox-root.Mui-checked svg': { color: '#fff', fill: '#fff' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 64, height: 64 }}>
            <LockOutlinedIcon sx={{ color: '#fff' }} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: '#fff' }}>
            Acceder
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mb: 2 }}>
            Introduce tus credenciales
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }} role="alert">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit} sx={{ mt: 1, width: "100%" }} noValidate role="form" aria-describedby={error ? 'login-error' : undefined}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              inputRef={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(emailError)}
              helperText={emailError ?? ''}
              sx={{
                '& .MuiInputBase-input': { color: '#ffffff' },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.72)' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' }
              }}
            />
            <FormControl margin="normal" required fullWidth variant="outlined" error={Boolean(passwordError)}>
              <InputLabel htmlFor="password">Contraseña</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                inputRef={passwordRef}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      type="button"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Contraseña"
                inputProps={{ name: 'password', 'aria-describedby': passwordError ? 'password-helper-text' : undefined }}
                sx={{ '& input': { color: '#ffffff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' } }}
              />
              {passwordError && <FormHelperText id="password-helper-text" sx={{ color: 'rgba(255,255,255,0.8)' }}>{passwordError}</FormHelperText>}
            </FormControl>

            <FormControlLabel
              control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} color="primary" />}
              label="Recordarme"
              sx={{ '& .MuiFormControlLabel-label': { color: 'rgba(255,255,255,0.9)' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2, py: 1.5, fontWeight: 700, textTransform: 'none' }}
              disabled={loading}
              aria-disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
              aria-busy={loading}
            >
              {loading ? "Accediendo..." : "Acceder"}
            </Button>

              {adminExists === false && (
                <Button
                  component={NextLink}
                  href="/register"
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  sx={{ mt: 1, textTransform: 'none' }}
                  aria-label="Crear cuenta de administrador"
                >
                  Crear cuenta de administrador
                </Button>
              )}
              {adminExists === true && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  
                </Typography>
              )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Link
                component={NextLink}
                href="/forgot-password"
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.9)' }}
              >
                ¿Olvidaste la contraseña?
              </Link>
              <Link component={NextLink} href="/" variant="body2">
                ← Volver al sitio
              </Link>
            </Box>
          </Box>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          © 2026 - Panel estilo WordPress
        </Typography>
      </Box>
        </Box>
      </Paper>
    </Box>
  );
}
