'use client';

import { useEffect, useState } from 'react';

export default function DebugArticles() {
  const [debug, setDebug] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debug_fetch() {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/articles?page=1&per_page=5`;
      
      try {
        console.log('🔵 Intentando conectar a:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('🟢 Response status:', response.status);
        const data = await response.json();
        console.log('🟢 Response data:', data);

        setDebug({
          url,
          status: response.status,
          ok: response.ok,
          data: data,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('🔴 Error:', error);
        setDebug({
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    debug_fetch();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white font-mono text-sm min-h-screen">
      <h1 className="text-2xl mb-4">🔧 DEBUG: Conexión API</h1>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <p className="mb-2"><strong>Entorno:</strong></p>
        <p className="text-blue-400">API_URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="mb-2"><strong>Respuesta:</strong></p>
        {loading ? (
          <p className="text-yellow-400">Cargando...</p>
        ) : (
          <pre className="text-green-400 overflow-auto max-h-96">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-8 bg-blue-900 p-4 rounded">
        <p><strong>📋 Mira la Consola (F12) para ver más detalles</strong></p>
      </div>
    </div>
  );
}
