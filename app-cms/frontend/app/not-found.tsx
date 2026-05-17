import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada | CMS",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        background: "linear-gradient(180deg, #0f1720 0%, #0b0f12 100%)",
        fontFamily: '"Open Sans", "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: "#0073aa",
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1
        style={{
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 700,
          margin: 0,
        }}
      >
        Página no encontrada
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 16,
          textAlign: "center",
          maxWidth: 480,
          margin: 0,
        }}
      >
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: 8,
          padding: "10px 24px",
          backgroundColor: "#0073aa",
          color: "#ffffff",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Volver al panel
      </Link>
    </div>
  );
}
