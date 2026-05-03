"use client";

import React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import { useThemeSettings } from "@/components/MuiProviders";
import { useAuth } from "@/context/AuthContext";

interface Props {
  role?: string | null;
  userId?: number | null;
  currentSiteId?: number | null;
  siteOwnerId?: number | null;
}

export default function LeftSidebar({
  role,
  userId,
  currentSiteId,
  siteOwnerId,
}: Props) {
  const { compactSidebar } = useThemeSettings();
  const auth = useAuth();
  const effectiveRole = role || auth.user?.role || "user";
  const effectiveUserId = userId ?? auth.user?.id ?? null;
  const drawerWidth = compactSidebar ? 80 : 240;

  const isViewingSite = !!currentSiteId;
  const isSiteOwner = Boolean(
    siteOwnerId != null &&
    effectiveUserId != null &&
    Number(siteOwnerId) === Number(effectiveUserId),
  );

  let menuItems: Array<{ text: string; href: string; icon?: React.ReactNode }> =
    [];

  if (effectiveRole === "admin") {
    menuItems = [
      { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
      { text: "Webs", href: "/dashboard/webs", icon: <PublicIcon /> },
      { text: "Usuarios", href: "/dashboard/users", icon: <GroupIcon /> },
    ];
  } else if (effectiveRole === "author") {
    if (isViewingSite && isSiteOwner) {
      // site management menu for owner
      menuItems = [
        { text: "Ver sitio", href: `/`, icon: <PublicIcon /> },
        {
          text: "Panel",
          href: `/dashboard/sites/${currentSiteId}`,
          icon: <DashboardIcon />,
        },
        {
          text: "Entradas",
          href: `/dashboard/sites/${currentSiteId}/entries`,
          icon: <ArticleIcon />,
        },
        {
          text: "Medios",
          href: `/dashboard/sites/${currentSiteId}/media`,
          icon: <PhotoLibraryIcon />,
        },
        {
          text: "Páginas",
          href: `/dashboard/sites/${currentSiteId}/pages`,
          icon: <DescriptionIcon />,
        },
        {
          text: "Categorías",
          href: `/dashboard/sites/${currentSiteId}/categories`,
          icon: <CategoryIcon />,
        },
        {
          text: "Etiquetas",
          href: `/dashboard/sites/${currentSiteId}/tags`,
          icon: <LabelIcon />,
        },
        {
          text: "Comentarios",
          href: `/dashboard/sites/${currentSiteId}/comments`,
          icon: <CommentIcon />,
        },
        {
          text: "Configuración",
          href: `/dashboard/sites/${currentSiteId}/settings`,
          icon: <SettingsIcon />,
        },
      ];
    } else {
      menuItems = [
        { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
        { text: "Webs", href: "/dashboard/webs", icon: <PublicIcon /> },
        {
          text: "Configuración",
          href: "/dashboard/settings",
          icon: <SettingsIcon />,
        },
      ];
    }
  } else {
    // default minimal menu
    menuItems = [
      { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
    ];
  }

  return (
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
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Typography variant="h6" sx={{ color: "#fff" }}>
          Mi Blog
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          Panel de administración
        </Typography>
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NextLink}
              href={item.href}
              sx={{ color: "#fff" }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          {auth.user?.name
            ? auth.user.name
            : effectiveRole === "admin"
              ? "Administrador"
              : effectiveRole}
        </Typography>
      </Box>
    </Drawer>
  );
}
