"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete, apiPost } from "@/lib/api";
import { getStoredToken } from '@/lib/auth';
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
  const auth = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('author');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: any = null;
      // Prefer session-verified requests, fallback to stored token if available
      if (auth.sessionVerified) {
        res = await apiGet("/users");
      } else {
        const token = getStoredToken();
        if (token) {
          res = await apiGet("/users", token);
        } else {
          setUsers([]);
          setError('No autenticado');
          return;
        }
      }
      setUsers((res as any) ?? []);
    } catch (err: any) {
      const info = err && typeof err === 'object'
        ? (err.message ?? err.statusText ?? JSON.stringify(err))
        : String(err);
      console.error('Error fetching users:', info);
      setError(info);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when we have an admin user (either session-verified or via stored token)
    if (auth.user?.role !== 'admin') {
      setUsers([]);
      setError(null);
      return;
    }
    fetchUsers();
  }, [auth.sessionVerified, auth.user?.role]);

  const handleRoleChange = async (id: number, role: string) => {
    setUpdating(id);
    try {
      await apiPut(`/users/${id}`, { role });
      await fetchUsers();
    } catch (err) {
      console.error("Error updating role", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    setCreating(true);
    try {
      await apiPost('/users', { name: newName, email: newEmail, password: newPassword, role: newRole });
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('author');
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await apiDelete(`/users/${id}`);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>
      {(!auth.isAuthenticated || auth.user?.role !== 'admin') ? (
        <div className="bg-white p-4 shadow">
          <form onSubmit={handleCreate} className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input className="border px-2 py-1" placeholder="Nombre" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className="border px-2 py-1" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            <input className="border px-2 py-1" placeholder="Contraseña" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div className="flex gap-2">
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="border px-2 py-1">
                <option value="admin">admin</option>
                <option value="author">author</option>
                <option value="editor">editor</option>
                <option value="user">user</option>
              </select>
              <button className="bg-green-600 text-white px-3 rounded" disabled={creating}>{creating ? 'Creando...' : 'Crear usuario'}</button>
            </div>
          </form>
          <p>
            Debes iniciar sesión como administrador para ver y gestionar
            usuarios.
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-4">
              <h2 className="font-semibold mb-2">Error al cargar usuarios</h2>
              <pre className="whitespace-pre-wrap text-sm bg-white p-2 border rounded">
                {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Nombre</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Rol</th>
                <th className="px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-2 py-2">{u.id}</td>
                    <td className="px-2 py-2">{u.name}</td>
                    <td className="px-2 py-2">{u.email}</td>
                    <td className="px-2 py-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                      >
                        <option value="admin">admin</option>
                        <option value="author">author</option>
                        <option value="editor">editor</option>
                        <option value="user">user</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 space-x-2">
                      <button
                        className="text-sm px-2 py-1 bg-red-100"
                        onClick={() => handleDelete(u.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
