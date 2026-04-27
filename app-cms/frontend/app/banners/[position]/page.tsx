'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { Banner, getBannersByPosition } from '@/lib/services/config';

export default function BannerByPositionPage({ params }: { params: Promise<{ position: string }> }) {
  const resolved = use(params);
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => {
    async function load() {
      setItems(await getBannersByPosition(resolved.position));
    }

    load();
  }, [resolved.position]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Banners por posicion</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /banners/{'{position}'}</p>

      <div className="space-y-3">
        {items.map((banner) => (
          <div key={banner.id} className="rounded border p-4">
            <p className="font-medium">{banner.title}</p>
            <p className="text-sm text-gray-600">{banner.position}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
