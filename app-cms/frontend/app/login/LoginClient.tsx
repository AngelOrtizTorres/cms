'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Box } from '@mui/material';
import { Paper } from '@mui/material';
import { TextField } from '@mui/material';
import { FormControl } from '@mui/material';
import { InputLabel } from '@mui/material';
import { OutlinedInput } from '@mui/material';
import { Button } from '@mui/material';
import { Typography } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { IconButton } from '@mui/material';
import { InputAdornment } from '@mui/material';

function VisibilityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function VisibilityOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.9 21.9 0 0 1 5.06-6.06" />
      <path d="M1 1l22 22" />
      <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
      <path d="M14.53 9.47A3 3 0 0 0 9.47 14.53" />
    </svg>
  );
}

export default function LoginClient() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[LoginClient] login error', err);
      setError(err?.message || 'Credenciales incorrectas');
    } finally {
      setLoadingLocal(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white shadow rounded p-6">
        <h1 className="text-xl font-semibold mb-4">CMS Login</h1>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Password</span>
          <div className="mt-1 relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2 pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 p-1"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
        </label>

        {error && (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loadingLocal ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}
