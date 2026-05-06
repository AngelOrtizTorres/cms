import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MuiProviders from "@/components/MuiProviders";

// Use system fonts instead of remote Google Fonts to avoid build-time fetch issues
const fontVars = `
  --font-geist-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-geist-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
`;

export const metadata: Metadata = {
  title: "CMS - Content Management System",
  description: "Sistema de gestión de contenidos profesional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning={true}
      style={{ all: "revert" } as React.CSSProperties}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <MuiProviders>
          <AuthProvider>{children}</AuthProvider>
        </MuiProviders>
      </body>
    </html>
  );
}
