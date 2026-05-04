import type { AppProps } from 'next/app';
import React from 'react';
import MuiProviders from '@/components/MuiProviders';
import { AuthProvider } from '@/context/AuthContext';
import '@/app/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MuiProviders>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </MuiProviders>
  );
}
