import Image from "next/image";
import Link from "next/link";

// ✅ Tipo del artículo
type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
};

// ✅ Tipo de respuesta de Laravel (paginate)
type ApiResponse = {
  data: Article[];
};

// ✅ Fetch corregido
async function getArticles(): Promise<Article[]> {
  const res = await fetch("http://localhost:8000/api/articles", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error al cargar artículos");
  }

  const json: ApiResponse = await res.json();

  return json.data; // 👈 AQUÍ ESTÁ LA CLAVE
}

// ✅ Página
export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black">
      
      {/* HEADER */}
      <header className="w-full bg-white dark:bg-zinc-900 shadow p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mi Blog</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/">Inicio</Link>
            <Link href="/articles">Artículos</Link>
            <Link href="/contact">Contacto</Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
        
        {/* POSTS */}
        <section className="md:col-span-2 flex flex-col gap-6">
          {articles.length === 0 && (
            <p>No hay artículos disponibles.</p>
          )}

          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow"
            >
              {article.image && (
                <Image
                  src={article.image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="rounded-lg mb-4"
                />
              )}

              <h2 className="text-xl font-semibold mb-2">
                {article.title}
              </h2>

              <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                {article.excerpt}
              </p>

              <Link
                href={`/articles/${article.slug}`}
                className="text-blue-600 font-medium"
              >
                Leer más →
              </Link>
            </article>
          ))}
        </section>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Sobre mí</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Blog hecho con Next.js + Laravel API.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Categorías</h3>
            <ul className="text-sm flex flex-col gap-1">
              <li>Tech</li>
              <li>Backend</li>
              <li>Frontend</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="text-center p-6 text-sm text-zinc-500">
        © 2026 - Mi Blog
      </footer>
    </div>
  );
}