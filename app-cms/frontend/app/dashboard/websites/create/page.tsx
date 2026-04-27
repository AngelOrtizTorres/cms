'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import websitesService from '@/lib/services/websites';

export default function CreateWebsitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [owner, setOwner] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await websitesService.createWebsite({ name, url, owner });
      // Ir al detalle del sitio creado
      router.push(`/dashboard/websites/${created.id}`);
    } catch (err: any) {
      console.error('Error creando sitio:', err);
      setError('Error creando sitio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Crear sitio</h1>
        <p className="text-sm text-gray-600">Añade un nuevo sitio web</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Propietario</label>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Creando...' : 'Crear sitio'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
