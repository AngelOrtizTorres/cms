"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Header from "@/components/Header";
import Typography from "@mui/material/Typography";
import { useThemeSettings } from "@/components/MuiProviders";
import LeftSidebar from "@/components/LeftSidebar";
import { useAuth } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import { apiGet } from "@/lib/api";

export default function AdminLayout({
  children,
  currentSiteId,
}: {
  children: React.ReactNode;
  currentSiteId?: number | string | null;
}) {
  const { compactSidebar } = useThemeSettings();
  const drawerWidth = compactSidebar ? 80 : 240;
  const auth = useAuth();

  const [siteOwnerId, setSiteOwnerId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentSiteId) {
        setSiteOwnerId(null);
        return;
      }

      let cancelled = false;
      try {
        const res = await apiGet(`/sites/${currentSiteId}`);
        if (cancelled) return;
        let ownerRaw: unknown = null;
        if (res && typeof res === 'object') {
          const r = res as Record<string, unknown>;
          if ('owner_id' in r) ownerRaw = r['owner_id'];
          else if ('data' in r && typeof (r as any).data === 'object') {
            const d = (r as any).data as Record<string, unknown>;
            if ('owner_id' in d) ownerRaw = d['owner_id'];
          }
        }

        const ownerNum = ownerRaw != null ? Number(ownerRaw) : null;
        setSiteOwnerId(ownerNum !== null && Number.isFinite(ownerNum) ? ownerNum : null);
      } catch (err) {
        console.error('Failed to load site owner', err);
        setSiteOwnerId(null);
      }

      return () => {
        cancelled = true;
      };
    };

    load();
  }, [currentSiteId]);

  const currentSiteNum = currentSiteId != null ? Number(currentSiteId) : null;

  return (
    <RequireAuth>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Header drawerWidth={drawerWidth} />

        <LeftSidebar
          role={auth.user?.role}
          userId={auth.user?.id}
          currentSiteId={currentSiteNum}
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
