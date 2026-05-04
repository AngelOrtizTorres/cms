"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SiteDashboardPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  const router = useRouter();
  const auth = useAuth();

  const [site, setSite] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirigir al login si ya cargó el estado de auth y no estamos autenticados
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!id) return;
    // Solo solicitar datos si estamos autenticados
    setLoading(true);
    apiGet(`/sites/${id}`)
      .then((res: any) => setSite(res))
      .catch((err) => {
        console.error("Error fetching site", err);
        setError(err?.message || "Error al cargar el sitio");
      })
      .finally(() => setLoading(false));
  }, [id, auth.isAuthenticated]);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!site) return <div className="p-4">Sitio no encontrado</div>;

  const canEnter = !!(auth.user && site.owner_id === auth.user?.id);

  if (!canEnter) {
    return (
      <div className="p-4">
        <p>No tienes permisos para ver el panel de esta web.</p>
        <div className="mt-2">
          <NextLink href="/dashboard/webs">
            <button className="px-3 py-1 border rounded">Volver a Webs</button>
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">
        Panel de {site.title || `#${site.id}`}
      </h1>
      <p className="text-sm text-gray-600">Dominio: {site.domain || "-"}</p>
      <div className="mt-4 space-x-2">
        <NextLink href={`/dashboard/sites/${id}/entries`}>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">
            Entradas
          </button>
        </NextLink>
        <NextLink href={`/dashboard/sites/${id}/media`}>
          <button className="px-3 py-1 bg-gray-600 text-white rounded">
            Medios
          </button>
        </NextLink>
      </div>
    </div>
  );
}
