'use client';

import React, { createContext, useContext, useState } from 'react';

export type SiteSummary = {
  id: string;
  name: string;
  url?: string;
  [key: string]: any;
} | null;

type SidebarContextValue = {
  selectedSite: SiteSummary;
  setSelectedSite: (s: SiteSummary) => void;
  clearSelectedSite: () => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  selectedSite: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedSite: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  clearSelectedSite: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [selectedSite, setSelectedSiteState] = useState<SiteSummary>(null);

  const setSelectedSite = (s: SiteSummary) => setSelectedSiteState(s);
  const clearSelectedSite = () => setSelectedSiteState(null);

  return (
    <SidebarContext.Provider value={{ selectedSite, setSelectedSite, clearSelectedSite }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export default SidebarContext;
