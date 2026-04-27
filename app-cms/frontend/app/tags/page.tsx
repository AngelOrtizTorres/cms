'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Tag, getTags } from '@/lib/services/articles';

export default function TagsPage() {
  const [items, setItems] = useState<Tag[]>([]);

  useEffect(() => {
    async function load() {
      setItems(await getTags());
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Etiquetas</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /tags</p>

      <div className="flex flex-wrap gap-2">
        {items.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-full border px-4 py-2 hover:bg-gray-50"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
