"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPostFormData, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NextLink from "next/link";

export default function WebsPage() {
  const auth = useAuth();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<string | 'all'>('all');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any[]>("/sites");
      // Api returns array directly
      setSites((res as any) ?? []);
    } catch (err) {
      console.error("Error fetching sites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Derive owner options for select (admin & author only)
  const ownerOptions = Array.from(new Map(sites.map(s => [String(s.owner_id), s.creator_email || String(s.owner_id)])).values());

  const canEdit = (site: any) => {
    const role = auth.user?.role;
    if (!auth.user) return false;
    if (role === "admin") return true;
    if (role === "author")
      return Number(site.owner_id) === Number(auth.user?.id);
    return false;
  };

  const canEnter = (site: any) => {
    if (!auth.user) return false;
    const role = auth.user?.role;
    if (role === 'admin') return true;
    if (role === 'author') return Number(site.owner_id) === Number(auth.user?.id);
    return false;
  };

  const canView = (site: any) => {
    if (!auth.user) return false;
    const role = auth.user?.role;
    if (role === 'admin') return true;
    if (role === 'author') return Number(site.owner_id) === Number(auth.user?.id);
    return false;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !contactEmail) return;
    setCreating(true);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('email', contactEmail);
      if (domain) form.append('domain', domain);
      if (iconFile) form.append('icon', iconFile);

      await apiPostFormData('/sites', form);
      setTitle('');
      setDomain('');
      setDescription('');
      setContactEmail('');
      setIconFile(null);
      await fetchSites();
    } catch (err) {
      console.error('Error creating site', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este sitio?")) return;
    try {
      await apiDelete(`/sites/${id}`);
      await fetchSites();
    } catch (err) {
      console.error("Error deleting site", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Webs</h1>

      <div className="mb-4">
        {(auth.user?.role === 'admin' || auth.user?.role === 'author') && (
          <div className="mb-2">
            <label className="mr-2">Filtrar por owner:</label>
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="all">Todas</option>
              {Array.from(new Map(sites.map(s => [String(s.owner_id), s])).values()).map(s => (
                <option key={s.owner_id} value={String(s.owner_id)}>{s.creator_email || s.owner_id}</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
          <input
            className="border rounded px-2 py-1 flex-1 min-w-[180px]"
            placeholder="Título de la web"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 min-w-[160px]"
            placeholder="Dominio (opcional)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 min-w-[220px]"
            placeholder="Correo de contacto"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] ?? null)} />
          <button
            className="bg-blue-600 text-white px-3 rounded"
            disabled={creating || !auth.user || !auth.sessionVerified}
            type="submit"
          >
            {creating ? "Creando..." : "Crear web"}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-1">Título</th>
              <th className="px-2 py-1">Owner</th>
              <th className="px-2 py-1">Dominio</th>
              <th className="px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4">
                  Cargando...
                </td>
              </tr>
            ) : sites.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4">
                  No hay webs
                </td>
              </tr>
            ) : (
              sites.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-2 py-2">{s.title}<div className="text-sm text-gray-600">{s.description}</div></td>
                  <td className="px-2 py-2">{s.creator_email || s.owner_id}</td>
                  <td className="px-2 py-2">{s.domain || "-"}</td>
                  <td className="px-2 py-2 space-x-2">
                    {canView(s) && (
                      <NextLink href={s.domain ? `https://${s.domain}` : `/`}>
                        <button className="text-sm px-2 py-1 bg-gray-100 rounded">Ver</button>
                      </NextLink>
                    )}

                    <NextLink href={`/dashboard/sites/${s.id}`}>
                      <button className="text-sm px-2 py-1 bg-gray-100 rounded" disabled={!canEnter(s)}>Entrar</button>
                    </NextLink>

                    <NextLink href={`/dashboard/sites/${s.id}/edit`}>
                      <button className="text-sm px-2 py-1 bg-yellow-100 rounded" disabled={!canEdit(s)}>Editar</button>
                    </NextLink>

                    <button className="text-sm px-2 py-1 bg-red-100 rounded" onClick={() => handleDelete(s.id)} disabled={!canEdit(s)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
