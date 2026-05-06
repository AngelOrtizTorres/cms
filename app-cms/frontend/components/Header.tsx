"use client";

import React from "react";
import NextLink from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
// Tooltip removed — header simplified
import BannerDisplay from "@/components/BannerDisplay";
import { useAuth } from "@/context/AuthContext";

export default function Header({ drawerWidth = 0 }: { drawerWidth?: number }) {
  const auth = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(35,40,45,0.95)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left header brand removed per request (avatar + site name) */}

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BannerDisplay position="header" />
        </Box>

        {/* Right header actions removed for a cleaner, modern header */}
      </Toolbar>
    </AppBar>
  );
}
