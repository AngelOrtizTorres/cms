"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Header from "@/components/Header";
import Typography from "@mui/material/Typography";
import { useThemeSettings } from "@/components/MuiProviders";
import LeftSidebar from "@/components/LeftSidebar";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { compactSidebar } = useThemeSettings();
  const drawerWidth = compactSidebar ? 80 : 240;
  const auth = useAuth();
  const pathname = usePathname();
 

  // Protected layout: RequireAuth will redirect to /login if not authenticated

  const [currentSiteId, setCurrentSiteId] = useState<number | null>(null);
  const [siteOwnerId, setSiteOwnerId] = useState<number | null>(null);

  useEffect(() => {
    if (!pathname) {
      setCurrentSiteId(null);
      setSiteOwnerId(null);
      return;
    }

    const m = pathname.match(/^\/dashboard\/sites\/([^\/]+)/);
    const id = m ? m[1] : null;
    setCurrentSiteId(id ? Number(id) : null);

    if (!id || !auth.isAuthenticated) {
      setSiteOwnerId(null);
      return;
    }

    let cancelled = false;
    apiGet(`/sites/${id}`)
      .then((res: unknown) => {
        if (cancelled) return;
        let ownerRaw: unknown = null;
        if (res && typeof res === "object") {
          const r = res as Record<string, unknown>;
          if ("owner_id" in r) ownerRaw = r["owner_id"];
          else if ("data" in r && typeof r.data === "object") {
            const d = r.data as Record<string, unknown>;
            if ("owner_id" in d) ownerRaw = d["owner_id"];
          }
        }

        const ownerNum = ownerRaw != null ? Number(ownerRaw) : null;
        setSiteOwnerId(
          ownerNum !== null && Number.isFinite(ownerNum) ? ownerNum : null,
        );
      })
      .catch((err) => {
        console.error("Failed to load site owner", err);
        setSiteOwnerId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, auth.isAuthenticated]);
  // Nav items removed (unused) — LeftSidebar builds menu based on role/site

  return (
    <RequireAuth>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Header drawerWidth={drawerWidth} />

        <LeftSidebar
          role={auth.user?.role}
          userId={auth.user?.id}
          currentSiteId={currentSiteId}
          siteOwnerId={siteOwnerId}
        />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 0, mb: 2 }}>
            <Typography variant="h5">Escritorio</Typography>
            <Typography variant="body2" color="text.secondary">
              Bienvenido
            </Typography>
          </Box>
          <Box>{children}</Box>
        </Box>
      </Box>
    </RequireAuth>
  );
}
