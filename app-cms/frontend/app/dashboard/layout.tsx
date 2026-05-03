"use client";

import React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Header from "@/components/Header";
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
import LeftSidebar from "@/components/LeftSidebar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { compactSidebar } = useThemeSettings();
  const drawerWidth = compactSidebar ? 80 : 240;
  const auth = useAuth();
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
      <Header drawerWidth={drawerWidth} />

      <LeftSidebar role={auth.user?.role} userId={auth.user?.id} />

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
  );
}
