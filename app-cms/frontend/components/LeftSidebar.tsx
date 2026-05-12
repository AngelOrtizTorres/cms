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
import HomeIcon from '@mui/icons-material/Home';
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
            color: "#cfd8dc",
            borderRight: (theme) => theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.04)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.32)',
            transition: 'width 200ms ease',
          },
      }}
    >
      <Box sx={{ p: 1, borderBottom: (theme) => theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <NextLink href="/" legacyBehavior>
          <Box component="a" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', width: compactSidebar ? 40 : 'auto', justifyContent: compactSidebar ? 'center' : 'flex-start' }}>
            {compactSidebar ? (
              <HomeIcon sx={{ color: 'inherit' }} />
            ) : (
              <Typography variant="subtitle1" sx={{ color: 'inherit', fontWeight: 600, textAlign: 'center', width: '100%' }}>Mi sitio</Typography>
            )}
          </Box>
        </NextLink>

        <Tooltip title={compactSidebar ? 'Expandir menú' : 'Minimizar menú'}>
          <IconButton onClick={toggleCompact} sx={{ color: 'inherit' }} size="small" aria-label="toggle-sidebar">
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
                      sx={{ color: 'inherit', borderRadius: 0, transition: 'background-color 160ms ease' , '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                    onClick={() => setEntriesOpen((s) => !s)}
                    aria-expanded={entriesOpen}
                  >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: compactSidebar ? 'auto' : 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                      {!compactSidebar && <ListItemText primary={item.text} />}
                      {entriesOpen ? (
                        <ExpandLess sx={{ color: 'inherit' }} />
                      ) : (
                        <ExpandMore sx={{ color: 'inherit' }} />
                      )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={entriesOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ bgcolor: 'transparent' }}>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/entries/articulos`}
                        sx={{ pl: compactSidebar ? 1 : 4, color: 'inherit', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.54)' : 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Artículos" />}
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                          component={NextLink}
                          href={`/dashboard/sites/${stableCurrentSiteId}/entries/seccion`}
                          sx={{ pl: compactSidebar ? 1 : 4, color: 'inherit', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                          onClick={handleEntriesClose}
                        >
                          <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                            <Box sx={{ width: 8, height: 8, bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.54)' : 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                          </ListItemIcon>
                          {!compactSidebar && <ListItemText primary="Sección" />}
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/entries/noticias`}
                        sx={{ pl: compactSidebar ? 1 : 4, color: 'inherit', justifyContent: compactSidebar ? 'center' : undefined, borderRadius: 0, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon sx={{ minWidth: compactSidebar ? 'auto' : 28, justifyContent: 'center' }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.54)' : 'rgba(255,255,255,0.75)', borderRadius: '50%' }} />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Noticias" />}
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
                sx={{ color: 'inherit', justifyContent: compactSidebar ? 'center' : 'flex-start', px: compactSidebar ? 1 : 2, borderRadius: 0, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: compactSidebar ? 'auto' : 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                {!compactSidebar && <ListItemText primary={item.text} />}
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

      <Box sx={{ p: 2, borderTop: (theme) => theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: compactSidebar ? 'center' : 'flex-start' }}>
          <Avatar sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.primary.main, color: (theme) => theme.palette.mode === 'light' ? '#23282d' : theme.palette.getContrastText(theme.palette.primary.main), width: 32, height: 32, fontSize: 14 }}>
            {auth.user?.name ? auth.user.name[0] : 'U'}
          </Avatar>
          {!compactSidebar && (
            <Typography variant="caption" sx={{ color: 'inherit' }}>
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
