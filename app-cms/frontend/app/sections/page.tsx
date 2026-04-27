'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Section, getSections } from '@/lib/services/articles';

export default function SectionsPage() {
  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSections();
      setItems(data);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Secciones</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /sections</p>
      {loading ? <p>Cargando...</p> : null}

      <div className="grid gap-3">
        {items.map((section) => (
          <Link
            key={section.id}
            href={`/sections/${section.slug}`}
            className="rounded border p-4 hover:bg-gray-50"
          >
            <p className="font-medium">{section.name}</p>
            <p className="text-sm text-gray-600">/{section.slug}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
