"use client";

import React from "react";
import { useParams } from "next/navigation";
import BannersManager from "@/components/dashboard/BannersManager";

export default function SiteBannersPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  return <BannersManager siteId={id} />;
}
