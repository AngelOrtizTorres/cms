import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MuiProviders from "@/components/MuiProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "CMS - Content Management System",
    template: "%s | CMS",
  },
  description: "Sistema de gestión de contenidos profesional",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: "CMS - Content Management System",
    description: "Sistema de gestión de contenidos profesional",
  },
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
      className={`h-full antialiased ${inter.variable} ${robotoMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <MuiProviders>
          <AuthProvider>{children}</AuthProvider>
        </MuiProviders>
      </body>
    </html>
  );
}
