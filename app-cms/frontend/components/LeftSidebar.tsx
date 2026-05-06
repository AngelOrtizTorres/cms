"use client";

import React, { useState } from "react";
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
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useThemeSettings } from "@/components/MuiProviders";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';

const BannerDisplay = dynamic(() => import('@/components/BannerDisplay'), { ssr: false });

interface Props {
  role?: string | null;
  userId?: number | null;
  currentSiteId?: string | number | null;
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

  // state for the Entradas submenu (hover/click expandable)
  const [entriesOpen, setEntriesOpen] = useState(false);
  const handleEntriesOpen = () => setEntriesOpen(true);
  const handleEntriesClose = () => setEntriesOpen(false);

  if (effectiveRole === "admin") {
    menuItems = [
      { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
      { text: "Webs", href: "/dashboard/webs", icon: <PublicIcon /> },
      { text: "Usuarios", href: "/dashboard/users", icon: <GroupIcon /> },
    ];
  } else if (effectiveRole === "author") {
    if (isViewingSite && isSiteOwner) {
      // site management menu for owner — new requested order
        menuItems = [
        { text: "Ver sitio", href: `/`, icon: <PublicIcon /> },
        { text: "Panel", href: `/dashboard/sites/${currentSiteId}`, icon: <DashboardIcon /> },
        { text: "Secciones", href: `/dashboard/sites/${currentSiteId}/sections`, icon: <CategoryIcon /> },
        { text: "Categorías", href: `/dashboard/sites/${currentSiteId}/categories`, icon: <DescriptionIcon /> },
        { text: "Etiquetas", href: `/dashboard/sites/${currentSiteId}/tags`, icon: <LabelIcon /> },
        { text: "Banners", href: `/dashboard/sites/${currentSiteId}/banners`, icon: <PhotoLibraryIcon /> },
        { text: "Noticias", href: `/dashboard/sites/${currentSiteId}/news`, icon: <ArticleIcon /> },
        { text: "Configuración", href: `/dashboard/sites/${currentSiteId}/settings`, icon: <SettingsIcon /> },
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
        {menuItems.map((item) => {
          if (item.text === 'Entradas') {
            return (
              <Box key={item.text} onMouseEnter={handleEntriesOpen} onMouseLeave={handleEntriesClose}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ color: "#fff" }}
                    onClick={() => setEntriesOpen((s) => !s)}
                    aria-expanded={entriesOpen}
                  >
                    <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { color: '#fff' } }} />
                    {entriesOpen ? (
                      <ExpandLess sx={{ color: '#fff' }} />
                    ) : (
                      <ExpandMore sx={{ color: '#fff' }} />
                    )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={entriesOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: 'transparent' }}>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${currentSiteId}/entries/articulos`}
                        sx={{ pl: 4, color: '#fff' }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        <ListItemText primary="Artículos" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${currentSiteId}/entries/seccion`}
                        sx={{ pl: 4, color: '#fff' }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        <ListItemText primary="Sección" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${currentSiteId}/entries/noticias`}
                        sx={{ pl: 4, color: '#fff' }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        <ListItemText primary="Noticias" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NextLink}
                href={item.href}
                sx={{ color: "#fff" }}
              >
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { color: '#fff' } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        {currentSiteId ? <BannerDisplay position="sidebar" siteId={currentSiteId} maxHeight={180} /> : <BannerDisplay position="sidebar" maxHeight={180} />}
      </Box>

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
