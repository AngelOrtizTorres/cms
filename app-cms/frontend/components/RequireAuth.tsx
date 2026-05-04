"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      // redirect to login and keep next param
      const next = pathname || "/";
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [auth.loading, auth.isAuthenticated, router, pathname]);

  if (auth.loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated) return null;

  return <>{children}</>;
}
