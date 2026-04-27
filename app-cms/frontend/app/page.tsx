import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-3">Frontend conectado a API</h1>
      <p className="text-gray-600 mb-8">
        Cada ruta del frontend consume su endpoint homologo en Laravel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/endpoints" className="rounded border p-4 hover:bg-gray-50">/endpoints {'->'} GET /api (catalogo)</Link>
        <Link href="/articles" className="rounded border p-4 hover:bg-gray-50">/articles {'->'} GET /articles</Link>
        <Link href="/sections" className="rounded border p-4 hover:bg-gray-50">/sections {'->'} GET /sections</Link>
        <Link href="/tags" className="rounded border p-4 hover:bg-gray-50">/tags {'->'} GET /tags</Link>
        <Link href="/banners" className="rounded border p-4 hover:bg-gray-50">/banners {'->'} GET /banners</Link>
        <Link href="/search?q=noticia" className="rounded border p-4 hover:bg-gray-50">/search?q=... {'->'} GET /search</Link>
        <Link href="/contact" className="rounded border p-4 hover:bg-gray-50">/contact {'->'} POST /contact</Link>
        <Link href="/auth/me" className="rounded border p-4 hover:bg-gray-50">/auth/me {'->'} GET /auth/me</Link>
        <Link href="/users" className="rounded border p-4 hover:bg-gray-50">/users {'->'} GET /users (admin)</Link>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        Tambien puedes abrir detalles dinamicos como /articles/[slug], /sections/[slug], /tags/[slug], /banners/[position].
      </p>
    </main>
  );
}
