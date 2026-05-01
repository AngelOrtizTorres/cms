export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Escritorio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">Bienvenido</h2>
            <p className="text-sm text-gray-600">Resumen rápido del sitio.</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Publicaciones recientes</h3>
            <p className="text-sm text-gray-600">
              Aquí iría una lista de artículos.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Actividad</h3>
            <p className="text-sm text-gray-600">Últimas acciones.</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Estado del sitio</h3>
            <p className="text-sm text-gray-600">Estado general.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
