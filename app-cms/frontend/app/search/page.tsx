import { Suspense } from 'react';
import SearchClient from './search-client';

export default function Page() {
  return (
    <Suspense fallback={<p>Cargando búsqueda...</p>}>
      <SearchClient />
    </Suspense>
  );
}