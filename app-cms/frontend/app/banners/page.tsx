'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Banner, getBanners } from '@/lib/services/config';

export default function BannersPage() {
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => {
    async function load() {
      setItems(await getBanners());
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Banners</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /banners</p>

      <div className="space-y-3">
        {items.map((banner) => (
          <div key={banner.id} className="rounded-lg border p-4">
            <p className="font-semibold">{banner.title}</p>
            <p className="text-sm text-gray-600 mt-1">Posicion: {banner.position}</p>
            <Link className="text-sm text-blue-600" href={`/banners/${banner.position}`}>
              Ver por posicion ({banner.position})
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
