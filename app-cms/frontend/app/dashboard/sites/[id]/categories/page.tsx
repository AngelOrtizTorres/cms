"use client";

import React from "react";
import { useParams } from "next/navigation";
import CategoriesManager from "@/components/dashboard/CategoriesManager";

export default function SiteCategoriesPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  return <CategoriesManager siteId={id} />;
}
