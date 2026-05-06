"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PublicIcon from "@mui/icons-material/Public";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeSettings } from "@/components/MuiProviders";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';
import LogoutButton from "@/components/LogoutButton";

const BannerDisplay = dynamic(() => import('@/components/BannerDisplay'), { ssr: false });

interface Props {
  role?: string | null;
  userId?: number | null;
  currentSiteId?: string | number | null;
  // undefined = loading, null = no owner / not applicable, number = owner id
  siteOwnerId?: number | null | undefined;
}

export default function LeftSidebar({
  role,
  userId,
  currentSiteId,
  siteOwnerId,
}: Props) {
  const { compactSidebar, setCompactSidebar } = useThemeSettings();
  const auth = useAuth();
  const effectiveRole = role || auth.user?.role || "user";
  const effectiveUserId = userId ?? auth.user?.id ?? null;
  const drawerWidth = compactSidebar ? 80 : 240;

  const toggleCompact = () => setCompactSidebar(!compactSidebar);

  // keep a stable snapshot of the last-resolved site values
  const [stableSiteState, setStableSiteState] = useState<{
    currentSiteId?: string | number | null;
    siteOwnerId?: number | null | undefined;
  }>({ currentSiteId, siteOwnerId });

  useEffect(() => {
    // only update the stable snapshot when siteOwnerId is resolved (not undefined)
    if (siteOwnerId !== undefined) {
      setStableSiteState({ currentSiteId, siteOwnerId });
    }
  }, [siteOwnerId, currentSiteId]);

  const stableCurrentSiteId = stableSiteState.currentSiteId;
  const stableSiteOwnerId = stableSiteState.siteOwnerId;

  // consider 'viewing site' only when we have a resolved owner in the stable snapshot
  const isViewingSite = !!stableCurrentSiteId && stableSiteOwnerId !== undefined;
  const isSiteOwner = Boolean(
    stableSiteOwnerId != null &&
    effectiveUserId != null &&
    Number(stableSiteOwnerId) === Number(effectiveUserId),
  );

  let menuItems: Array<{ text: string; href: string; icon?: React.ReactNode }> = [];

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
        { text: "Panel", href: `/dashboard/sites/${stableCurrentSiteId}`, icon: <DashboardIcon /> },
        { text: "Secciones", href: `/dashboard/sites/${stableCurrentSiteId}/sections`, icon: <CategoryIcon /> },
        { text: "Categorías", href: `/dashboard/sites/${stableCurrentSiteId}/categories`, icon: <DescriptionIcon /> },
        { text: "Etiquetas", href: `/dashboard/sites/${stableCurrentSiteId}/tags`, icon: <LabelIcon /> },
        { text: "Banners", href: `/dashboard/sites/${stableCurrentSiteId}/banners`, icon: <PhotoLibraryIcon /> },
        { text: "Media", href: `/dashboard/sites/${stableCurrentSiteId}/media`, icon: <PhotoLibraryIcon /> },
        { text: "Noticias", href: `/dashboard/sites/${stableCurrentSiteId}/news`, icon: <ArticleIcon /> },
        { text: "Configuración", href: `/dashboard/sites/${stableCurrentSiteId}/settings`, icon: <SettingsIcon /> },
      ];
    } else {
      menuItems = [
        { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
        { text: "Webs", href: "/dashboard/webs", icon: <PublicIcon /> },
        { text: "Configuración", href: "/dashboard/settings", icon: <SettingsIcon /> },
      ];
    }
  } else {
    // default minimal menu
    menuItems = [{ text: "Panel", href: "/dashboard", icon: <DashboardIcon /> }];
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
          borderRight: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.32)',
          transition: 'width 200ms ease',
        },
      }}
    >
      <Box sx={{ p: 1, borderBottom: "1px solid rgba(255,255,255,0.06)", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: "white", color: "#23282d", fontWeight: "bold", width: 32, height: 32, fontSize: 16 }}>W</Avatar>
          {!compactSidebar && (
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", lineHeight: 1 }}>
                Mi Blog
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)">
                Panel de administración
              </Typography>
            </Box>
          )}
        </Box>

        <Tooltip title={compactSidebar ? 'Expandir menú' : 'Minimizar menú'}>
          <IconButton onClick={toggleCompact} sx={{ color: '#fff' }} size="small" aria-label="toggle-sidebar">
            {compactSidebar ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          if (item.text === 'Entradas') {
            return (
              <Box key={item.text} onMouseEnter={handleEntriesOpen} onMouseLeave={handleEntriesClose}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{ color: "#fff", borderRadius: 0, transition: 'background-color 160ms ease' , '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                    onClick={() => setEntriesOpen((s) => !s)}
                    aria-expanded={entriesOpen}
                  >
                    <ListItemIcon sx={{ color: "#fff", minWidth: compactSidebar ? 'auto' : 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                    {!compactSidebar && <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { color: '#fff' } }} />}
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
                        href={`/dashboard/sites/${stableCurrentSiteId}/entries/articulos`}
                        sx={{ pl: compactSidebar ? 1 : 4, color: '#fff', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Artículos" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />}
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/entries/seccion`}
                        sx={{ pl: compactSidebar ? 1 : 4, color: '#fff', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Sección" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />}
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/entries/noticias`}
                        sx={{ pl: compactSidebar ? 1 : 4, color: '#fff', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' } }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Noticias" sx={{ '& .MuiTypography-root': { color: '#fff' } }} />}
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
                sx={{ color: "#fff", justifyContent: compactSidebar ? 'center' : 'flex-start', px: compactSidebar ? 1 : 2, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' } }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: compactSidebar ? 'auto' : 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                {!compactSidebar && <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { color: '#fff' } }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        {stableCurrentSiteId && stableSiteOwnerId !== undefined ? (
          <BannerDisplay position="sidebar" siteId={stableCurrentSiteId} maxHeight={180} />
        ) : (
          <BannerDisplay position="sidebar" maxHeight={180} />
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: compactSidebar ? 'center' : 'flex-start' }}>
          <Avatar sx={{ bgcolor: "white", color: "#23282d", width: 32, height: 32, fontSize: 14 }}>
            {auth.user?.name ? auth.user.name[0] : 'U'}
          </Avatar>
          {!compactSidebar && (
            <Typography variant="caption" color="rgba(255,255,255,0.6)">
              {auth.user?.name
                ? auth.user.name
                : effectiveRole === "admin"
                  ? "Administrador"
                  : effectiveRole}
            </Typography>
          )}

          <Box sx={{ ml: 'auto' }}>
            <LogoutButton compact={compactSidebar} />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
