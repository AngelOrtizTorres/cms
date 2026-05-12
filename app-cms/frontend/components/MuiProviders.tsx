"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ThemeSettings {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  compactSidebar: boolean;
  setCompactSidebar: (v: boolean) => void;
}

const defaultSettings: ThemeSettings = {
  mode: "light",
  toggleMode: () => {},
  setMode: () => {},
  primaryColor: "#0073aa",
  setPrimaryColor: () => {},
  compactSidebar: false,
  setCompactSidebar: () => {},
};

const ThemeSettingsContext = createContext<ThemeSettings>(defaultSettings);

export function useThemeSettings() {
  return useContext(ThemeSettingsContext);
}

export default function MuiProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("cms_theme_mode") as ThemeMode) || "light";
    } catch {
      return "light";
    }
  });

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    try {
      return localStorage.getItem("cms_primary_color") || "#0073aa";
    } catch {
      return "#0073aa";
    }
  });

  const [compactSidebar, setCompactSidebar] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cms_compact_sidebar") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cms_theme_mode", mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem("cms_primary_color", primaryColor);
    } catch {}
  }, [primaryColor]);

  useEffect(() => {
    try {
      localStorage.setItem("cms_compact_sidebar", compactSidebar ? "1" : "0");
    } catch {}
  }, [compactSidebar]);

  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryColor,
          },
          text: {
            primary: mode === 'light' ? '#111111' : '#ffffff',
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
          },
        },
        typography: {
          // WordPress admin uses a humanist sans; use Open Sans stack
          fontFamily:
            '"Open Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          button: { textTransform: "none" },
        },
        shape: { borderRadius: 0 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {},
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {},
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {},
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {},
              input: {},
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              input: {},
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {},
            },
          },
          MuiFormHelperText: {
            styleOverrides: {
              root: {
                color: mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.72)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 0,
                backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(10,12,15,0.96)'
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 0,
                color: mode === "light" ? "#111111" : "#ffffff",
                boxShadow: 'none',
                "&.MuiButton-containedPrimary": {
                  backgroundColor: primaryColor,
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#006799",
                  },
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                borderRadius: 0,
                boxShadow: "none",
                backgroundColor: mode === 'light' ? '#23282d' : '#23282d',
              },
            },
          },
        },
      }),
    [mode, primaryColor],
  );

  const value: ThemeSettings = {
    mode,
    toggleMode,
    setMode,
    primaryColor,
    setPrimaryColor,
    compactSidebar,
    setCompactSidebar,
  };

  return (
    <ThemeSettingsContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSettingsContext.Provider>
  );
}
