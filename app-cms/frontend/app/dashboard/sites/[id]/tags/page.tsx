"use client";

import React from "react";
import { useParams } from "next/navigation";
import TagsManager from "@/components/dashboard/TagsManager";

export default function SiteTagsPage() {
  const params = useParams() as { id: string };
  const id = params?.id;
  return <TagsManager siteId={id} />;
}
