"use client";

import React from "react";
import { useParams } from "next/navigation";
import NewsManager from "@/components/dashboard/NewsManager";

export default function SiteNewsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  return <NewsManager siteId={id} />;
}
