"use client";

import React from "react";
import { useParams } from "next/navigation";
import SectionsManager from "@/components/dashboard/SectionsManager";

export default function SiteSectionsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  return <SectionsManager siteId={id} />;
}
