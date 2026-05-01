"use client";

import React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";
import BrushIcon from "@mui/icons-material/Brush";
import ExtensionIcon from "@mui/icons-material/Extension";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import AddBoxIcon from "@mui/icons-material/AddBox";
import LogoutButton from "@/components/LogoutButton";
import { useThemeSettings } from "@/components/MuiProviders";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { compactSidebar } = useThemeSettings();
  const drawerWidth = compactSidebar ? 80 : 240;
  const navItems = [
    { text: "Escritorio", href: "/dashboard", icon: <DashboardIcon /> },
    { text: "Entradas", href: "/dashboard/articles", icon: <ArticleIcon /> },
    { text: "Medios", href: "/dashboard/media", icon: <PhotoLibraryIcon /> },
    { text: "Páginas", href: "/dashboard/pages", icon: <DescriptionIcon /> },
    { text: "Comentarios", href: "/dashboard/comments", icon: <CommentIcon /> },
    { text: "Apariencia", href: "/dashboard/appearance", icon: <BrushIcon /> },
    { text: "Plugins", href: "/dashboard/plugins", icon: <ExtensionIcon /> },
    { text: "Usuarios", href: "/dashboard/users", icon: <GroupIcon /> },
    { text: "Ajustes", href: "/dashboard/settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#23282d",
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Crear">
              <IconButton color="inherit">
                <AddBoxIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Hola, admin
            </Typography>
            <Avatar
              sx={{ bgcolor: "white", color: "#23282d", width: 32, height: 32 }}
            >
              A
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#23282d",
            color: "#fff",
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Typography variant="h6">Mi Blog</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.6)">
              Panel de administración
            </Typography>
          </Box>

          <List sx={{ flex: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={NextLink}
                  href={item.href}
                  sx={{ color: "#fff" }}
                >
                  <ListItemIcon sx={{ color: "#fff" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <LogoutButton />
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="h5">Escritorio</Typography>
          <Typography variant="body2" color="text.secondary">
            Bienvenido
          </Typography>
        </Box>
        <Box>{children}</Box>
      </Box>
    </Box>
  );
}
