"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import BannerDisplay from "@/components/BannerDisplay";

export default function AdminHeader({ drawerWidth = 0 }: { drawerWidth?: number }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#23282d',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        borderBottom: (theme) => theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BannerDisplay position="header" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
