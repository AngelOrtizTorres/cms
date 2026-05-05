"use client";

import React from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";

export default function ClientAppWrapper({ Component, pageProps }: any) {
  const router = useRouter();
  const path = router.asPath || router.pathname || "";

  let content = <Component {...pageProps} />;

  if (typeof path === "string" && path.startsWith("/dashboard")) {
    const m = path.match(/^\/dashboard\/sites\/([^\/]+)/);
    const currentSiteId = m ? Number(m[1]) : undefined;
    content = <AdminLayout currentSiteId={currentSiteId}>{content}</AdminLayout>;
  }

  return content;
}
