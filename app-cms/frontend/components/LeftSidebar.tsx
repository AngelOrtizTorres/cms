"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
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
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import CommentIcon from "@mui/icons-material/Comment";
import PagesIcon from "@mui/icons-material/WebAsset";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import { useThemeSettings } from "@/components/MuiProviders";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import LogoutButton from "@/components/LogoutButton";

const BannerDisplay = dynamic(() => import("@/components/BannerDisplay"), {
  ssr: false,
});

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
  const pathname = usePathname();
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
  const isViewingSite =
    !!stableCurrentSiteId && stableSiteOwnerId !== undefined;
  const isSiteOwner = Boolean(
    stableSiteOwnerId != null &&
    effectiveUserId != null &&
    Number(stableSiteOwnerId) === Number(effectiveUserId),
  );

  let menuItems: Array<{ text: string; href: string; icon?: React.ReactNode }> =
    [];

  // state for the Entradas submenu (hover/click expandable)
  const [entriesOpen, setEntriesOpen] = useState(false);
  const handleEntriesOpen = () => setEntriesOpen(true);
  const handleEntriesClose = () => setEntriesOpen(false);

  if (effectiveRole === "admin") {
    if (isViewingSite && isSiteOwner) {
      // admin entered their own site — full site management menu
      menuItems = [
        { text: "Ver sitio", href: `/`, icon: <HomeIcon /> },
        {
          text: "Panel",
          href: `/dashboard/sites/${stableCurrentSiteId}`,
          icon: <DashboardIcon />,
        },
        {
          text: "Entradas",
          href: `/dashboard/sites/${stableCurrentSiteId}/news`,
          icon: <ArticleIcon />,
        },
        {
          text: "Medios",
          href: `/dashboard/sites/${stableCurrentSiteId}/media`,
          icon: <PhotoLibraryIcon />,
        },
        {
          text: "Páginas",
          href: `/dashboard/sites/${stableCurrentSiteId}/pages`,
          icon: <PagesIcon />,
        },
        {
          text: "Categorías",
          href: `/dashboard/sites/${stableCurrentSiteId}/categories`,
          icon: <CategoryIcon />,
        },
        {
          text: "Etiquetas",
          href: `/dashboard/sites/${stableCurrentSiteId}/tags`,
          icon: <LabelIcon />,
        },
        {
          text: "Comentarios",
          href: `/dashboard/sites/${stableCurrentSiteId}/comments`,
          icon: <CommentIcon />,
        },
        {
          text: "Configuración",
          href: `/dashboard/sites/${stableCurrentSiteId}/settings`,
          icon: <SettingsIcon />,
        },
      ];
    } else {
      menuItems = [
        { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
        { text: "Webs", href: "/dashboard/webs", icon: <PublicIcon /> },
        { text: "Usuarios", href: "/dashboard/users", icon: <GroupIcon /> },
      ];
    }
  } else if (effectiveRole === "author") {
    if (isViewingSite && isSiteOwner) {
      // site management menu per README spec
      menuItems = [
        { text: "Ver sitio", href: `/`, icon: <HomeIcon /> },
        {
          text: "Panel",
          href: `/dashboard/sites/${stableCurrentSiteId}`,
          icon: <DashboardIcon />,
        },
        {
          text: "Entradas",
          href: `/dashboard/sites/${stableCurrentSiteId}/news`,
          icon: <ArticleIcon />,
        },
        {
          text: "Medios",
          href: `/dashboard/sites/${stableCurrentSiteId}/media`,
          icon: <PhotoLibraryIcon />,
        },
        {
          text: "Páginas",
          href: `/dashboard/sites/${stableCurrentSiteId}/pages`,
          icon: <PagesIcon />,
        },
        {
          text: "Categorías",
          href: `/dashboard/sites/${stableCurrentSiteId}/categories`,
          icon: <CategoryIcon />,
        },
        {
          text: "Etiquetas",
          href: `/dashboard/sites/${stableCurrentSiteId}/tags`,
          icon: <LabelIcon />,
        },
        {
          text: "Comentarios",
          href: `/dashboard/sites/${stableCurrentSiteId}/comments`,
          icon: <CommentIcon />,
        },
        {
          text: "Configuración",
          href: `/dashboard/sites/${stableCurrentSiteId}/settings`,
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
    // editor: show site management menu when viewing a site they have access to
    if (isViewingSite) {
      menuItems = [
        { text: "Ver sitio", href: `/`, icon: <HomeIcon /> },
        {
          text: "Panel",
          href: `/dashboard/sites/${stableCurrentSiteId}`,
          icon: <DashboardIcon />,
        },
        {
          text: "Entradas",
          href: `/dashboard/sites/${stableCurrentSiteId}/news`,
          icon: <ArticleIcon />,
        },
        {
          text: "Medios",
          href: `/dashboard/sites/${stableCurrentSiteId}/media`,
          icon: <PhotoLibraryIcon />,
        },
        {
          text: "Páginas",
          href: `/dashboard/sites/${stableCurrentSiteId}/pages`,
          icon: <PagesIcon />,
        },
        {
          text: "Categorías",
          href: `/dashboard/sites/${stableCurrentSiteId}/categories`,
          icon: <CategoryIcon />,
        },
        {
          text: "Etiquetas",
          href: `/dashboard/sites/${stableCurrentSiteId}/tags`,
          icon: <LabelIcon />,
        },
        {
          text: "Comentarios",
          href: `/dashboard/sites/${stableCurrentSiteId}/comments`,
          icon: <CommentIcon />,
        },
        {
          text: "Configuración",
          href: `/dashboard/sites/${stableCurrentSiteId}/settings`,
          icon: <SettingsIcon />,
        },
      ];
    } else {
      menuItems = [
        { text: "Panel", href: "/dashboard", icon: <DashboardIcon /> },
      ];
    }
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
          borderRight: (theme) =>
            theme.palette.mode === "light"
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid rgba(255,255,255,0.04)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.32)",
          transition: "width 200ms ease",
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: (theme) =>
            theme.palette.mode === "light"
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <NextLink
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
            width: compactSidebar ? 40 : "auto",
            justifyContent: compactSidebar ? "center" : "flex-start",
          }}
        >
          {compactSidebar ? (
            <HomeIcon sx={{ color: "inherit" }} />
          ) : (
            <Typography
              variant="subtitle1"
              sx={{
                color: "inherit",
                fontWeight: 600,
                textAlign: "center",
                width: "100%",
              }}
            >
              Mi sitio
            </Typography>
          )}
        </NextLink>

        <Tooltip title={compactSidebar ? "Expandir menú" : "Minimizar menú"}>
          <IconButton
            onClick={toggleCompact}
            sx={{ color: "inherit" }}
            size="small"
            aria-label="toggle-sidebar"
          >
            {compactSidebar ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          if (item.text === "Entradas") {
            return (
              <Box
                key={item.text}
                onMouseEnter={handleEntriesOpen}
                onMouseLeave={handleEntriesClose}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      color: "inherit",
                      borderRadius: 0,
                      transition: "background-color 160ms ease",
                      "&:hover": {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                    }}
                    onClick={() => setEntriesOpen((s) => !s)}
                    aria-expanded={entriesOpen}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: compactSidebar ? "auto" : 40,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!compactSidebar && <ListItemText primary={item.text} />}
                    {entriesOpen ? (
                      <ExpandLess sx={{ color: "inherit" }} />
                    ) : (
                      <ExpandMore sx={{ color: "inherit" }} />
                    )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={entriesOpen} timeout="auto" unmountOnExit>
                  <List
                    component="div"
                    disablePadding
                    sx={{ bgcolor: "transparent" }}
                  >
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/articles`}
                        sx={{
                          pl: compactSidebar ? 1 : 4,
                          color: "inherit",
                          justifyContent: compactSidebar ? "center" : undefined,
                          borderRadius: 0,
                          "&:hover": {
                            backgroundColor: (theme) =>
                              theme.palette.action.hover,
                          },
                        }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: compactSidebar ? "auto" : 28,
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: (theme) =>
                                theme.palette.mode === "light"
                                  ? "rgba(0,0,0,0.54)"
                                  : "rgba(255,255,255,0.75)",
                              borderRadius: "50%",
                            }}
                          />
                        </ListItemIcon>
                        {!compactSidebar && (
                          <ListItemText primary="Artículos" />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/sections`}
                        sx={{
                          pl: compactSidebar ? 1 : 4,
                          color: "inherit",
                          justifyContent: compactSidebar ? "center" : undefined,
                          borderRadius: 0,
                          "&:hover": {
                            backgroundColor: (theme) =>
                              theme.palette.action.hover,
                          },
                        }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: compactSidebar ? "auto" : 28,
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: (theme) =>
                                theme.palette.mode === "light"
                                  ? "rgba(0,0,0,0.54)"
                                  : "rgba(255,255,255,0.75)",
                              borderRadius: "50%",
                            }}
                          />
                        </ListItemIcon>
                        {!compactSidebar && <ListItemText primary="Sección" />}
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NextLink}
                        href={`/dashboard/sites/${stableCurrentSiteId}/news`}
                        sx={{
                          pl: compactSidebar ? 1 : 4,
                          color: "inherit",
                          justifyContent: compactSidebar ? "center" : undefined,
                          borderRadius: 0,
                          "&:hover": {
                            backgroundColor: (theme) =>
                              theme.palette.action.hover,
                          },
                        }}
                        onClick={handleEntriesClose}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: compactSidebar ? "auto" : 28,
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: (theme) =>
                                theme.palette.mode === "light"
                                  ? "rgba(0,0,0,0.54)"
                                  : "rgba(255,255,255,0.75)",
                              borderRadius: "50%",
                            }}
                          />
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
                sx={{
                  color: "inherit",
                  justifyContent: compactSidebar ? "center" : "flex-start",
                  px: compactSidebar ? 1 : 2,
                  borderRadius: 0,
                  borderLeft: (
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname?.startsWith(item.href + "/")
                  )
                    ? "3px solid #0073aa"
                    : "3px solid transparent",
                  backgroundColor: (
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname?.startsWith(item.href + "/")
                  )
                    ? "rgba(0,115,170,0.12)"
                    : undefined,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: (
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href ||
                          pathname?.startsWith(item.href + "/")
                    )
                      ? "#4dd0e1"
                      : "inherit",
                    minWidth: compactSidebar ? "auto" : 40,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!compactSidebar && (
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        style: {
                          fontWeight: (
                            item.href === "/"
                              ? pathname === "/"
                              : pathname === item.href ||
                                pathname?.startsWith(item.href + "/")
                          )
                            ? 700
                            : 400,
                        },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        {stableCurrentSiteId && stableSiteOwnerId !== undefined ? (
          <BannerDisplay
            position="sidebar"
            siteId={stableCurrentSiteId}
            maxHeight={180}
          />
        ) : (
          <BannerDisplay position="sidebar" maxHeight={180} />
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: (theme) =>
            theme.palette.mode === "light"
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: compactSidebar ? "center" : "flex-start",
          }}
        >
          <Avatar
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.common.white
                  : theme.palette.primary.main,
              color: (theme) =>
                theme.palette.mode === "light"
                  ? "#23282d"
                  : theme.palette.getContrastText(theme.palette.primary.main),
              width: 32,
              height: 32,
              fontSize: 14,
            }}
          >
            {auth.user?.name ? auth.user.name[0] : "U"}
          </Avatar>
          {!compactSidebar && (
            <Typography variant="caption" sx={{ color: "inherit" }}>
              {auth.user?.name
                ? auth.user.name
                : effectiveRole === "admin"
                  ? "Administrador"
                  : effectiveRole}
            </Typography>
          )}

          <Box sx={{ ml: "auto" }}>
            <LogoutButton compact={compactSidebar} />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
