import type { AppProps } from 'next/app';
import React from 'react';
import dynamic from 'next/dynamic';
import MuiProviders from '@/components/MuiProviders';
import { AuthProvider } from '@/context/AuthContext';
import '@/app/globals.css';

const ClientApp = dynamic(() => import('@/components/ClientAppWrapper'), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MuiProviders>
      <AuthProvider>
        <ClientApp Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </MuiProviders>
  );
}
