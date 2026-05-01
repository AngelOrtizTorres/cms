"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

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
