"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Header from "@/components/Header";
import { useThemeSettings } from "@/components/MuiProviders";
import LeftSidebar from "@/components/LeftSidebar";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { compactSidebar } = useThemeSettings();
  const drawerWidth = compactSidebar ? 80 : 240;
  const auth = useAuth();
  const pathname = usePathname();

  const [currentSiteId, setCurrentSiteId] = useState<number | null>(null);
  const [siteOwnerId, setSiteOwnerId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

      try {
        const res = await apiGet(`/sites/${id}`);
        if (cancelled) return;

        let ownerRaw: unknown = null;
        if (res && typeof res === "object") {
          const r = res as Record<string, unknown>;
          if ("owner_id" in r) ownerRaw = r["owner_id"];
          else if ("data" in r && typeof (r['data'] as unknown) === "object") {
            const d = r['data'] as Record<string, unknown>;
            if ("owner_id" in d) ownerRaw = d["owner_id"];
          }
        }

        const ownerNum = ownerRaw != null ? Number(ownerRaw) : null;
        setSiteOwnerId(ownerNum !== null && Number.isFinite(ownerNum) ? ownerNum : null);
      } catch (err) {
        console.error("Failed to load site owner", err);
        setSiteOwnerId(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname, auth.isAuthenticated]);

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
          <Box>{children}</Box>
        </Box>
      </Box>
    </RequireAuth>
  );
}
