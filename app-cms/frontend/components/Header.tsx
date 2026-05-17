"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NextLink from "next/link";
import BannerDisplay from "@/components/BannerDisplay";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Panel",
  sites: "Sitios",
  articles: "Artículos",
  sections: "Secciones",
  news: "Noticias",
  media: "Medios",
  pages: "Páginas",
  comments: "Comentarios",
  settings: "Configuración",
  users: "Usuarios",
  banners: "Banners",
  tags: "Etiquetas",
  profile: "Perfil",
};

function buildBreadcrumbs(pathname: string | null) {
  if (!pathname) return [];
  const parts = pathname.split("/").filter(Boolean);
  let accumulated = "";
  return parts.map((part) => {
    accumulated += `/${part}`;
    const label =
      BREADCRUMB_LABELS[part] ??
      (part.length > 12 ? `${part.slice(0, 10)}…` : part);
    return { label, href: accumulated };
  });
}

export default function Header({ drawerWidth = 0 }: { drawerWidth?: number }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const crumbs = buildBreadcrumbs(pathname);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await auth.logout();
    router.replace("/login");
  };

  const userInitial = auth.user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(35,40,45,0.97)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: 52 }}>
        {/* Left: Breadcrumbs */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Breadcrumbs
            separator={
              <NavigateNextIcon
                fontSize="small"
                sx={{ color: "rgba(255,255,255,0.3)" }}
              />
            }
            sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
          >
            {crumbs.map((crumb, idx) =>
              idx < crumbs.length - 1 ? (
                <Typography
                  key={crumb.href}
                  component={NextLink}
                  href={crumb.href}
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    "&:hover": { color: "rgba(255,255,255,0.75)" },
                    whiteSpace: "nowrap",
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Typography
                  key={crumb.href}
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        </Box>

        {/* Center: Banner */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BannerDisplay position="header" />
        </Box>

        {/* Right: User avatar */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Tooltip title={auth.user?.name ?? "Usuario"}>
            <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: { elevation: 3, sx: { minWidth: 180, mt: 0.5 } },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {auth.user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {auth.user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleMenuClose}
            component={NextLink}
            href="/dashboard/profile"
            dense
          >
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            Mi perfil
          </MenuItem>
          <MenuItem onClick={handleLogout} dense sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
