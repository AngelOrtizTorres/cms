"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // replace to avoid back-navigation to protected pages; fallback to full redirect
      try {
        router.replace('/login');
      } catch (e) {
        // router.replace may throw in some edge cases — fallback
        try { window.location.href = '/login'; } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Tooltip title={loading ? "Saliendo..." : "Cerrar sesión"}>
        <span>
          <IconButton
            color="error"
            onClick={handleLogout}
            disabled={loading}
            size="small"
            sx={{ bgcolor: loading ? 'rgba(0,0,0,0.12)' : 'transparent' }}
            aria-label="Cerrar sesión"
          >
            <LogoutIcon />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      color="error"
      fullWidth
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </Button>
  );
}
