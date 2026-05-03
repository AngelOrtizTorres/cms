"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function EditSitePage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();

  const [site, setSite] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet(`/sites/${id}`)
      .then((res: any) => setSite(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!site) return;
    setTitle(site.title || "");
    setDomain(site.domain || "");
    setStatus(site.status || "active");
  }, [site]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await apiPut(
        `/sites/${id}`,
        { title, domain, status },
        auth.token || undefined,
      );
      router.push("/dashboard/webs");
    } catch (err) {
      console.error("Error updating site", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;
  if (!site) return <div className="p-4">Sitio no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Editar web</h1>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded w-full px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Dominio</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="border rounded w-full px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded w-full px-2 py-1"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            disabled={saving}
            type="submit"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded border"
            onClick={() => router.back()}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
