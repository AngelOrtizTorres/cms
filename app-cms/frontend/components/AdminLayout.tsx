"use client";

import React, { useEffect, useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminHeader from "@/components/AdminHeader";
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

  const adminTheme = useMemo(() => createTheme({
    palette: {
      // usar fondo claro en el contenido para evitar texto blanco ilegible
      mode: 'light',
      primary: { main: '#0073aa' },
      background: { default: '#f6f7f8', paper: '#ffffff' },
      text: { primary: '#111111' },
    },
    shape: { borderRadius: 0 },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: '#23282d', color: '#cfd8dc' }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundColor: '#23282d', color: '#cfd8dc' }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }
        }
      }
    }
  }), []);

  return (
    <RequireAuth>
      <ThemeProvider theme={adminTheme}>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <AdminHeader drawerWidth={drawerWidth} />

          <LeftSidebar
            role={auth.user?.role}
            userId={auth.user?.id}
            currentSiteId={currentSiteNum}
            siteOwnerId={siteOwnerId}
          />

          <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: (theme) => theme.palette.background.default, minHeight: '100vh', color: (theme) => theme.palette.text.primary }}>
            <Toolbar />
            <Box sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>{children}</Box>
          </Box>
        </Box>
      </ThemeProvider>
    </RequireAuth>
  );
}
