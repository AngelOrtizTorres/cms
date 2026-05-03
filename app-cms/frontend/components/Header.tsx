"use client";

import React from "react";
import NextLink from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LogoutButton from "@/components/LogoutButton";

export default function Header({ drawerWidth = 0 }: { drawerWidth?: number }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#23282d",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{ bgcolor: "white", color: "#23282d", fontWeight: "bold" }}
          >
            W
          </Avatar>
          <Typography
            variant="h6"
            component={NextLink}
            href="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            Mi Sitio
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
