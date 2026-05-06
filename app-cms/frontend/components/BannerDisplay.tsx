"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import Box from '@mui/material/Box';

type Banner = {
  id: number;
  title: string;
  image_url?: string;
  link_url?: string;
  type?: 'image' | 'code';
  position?: string;
  code_content?: string | null;
  active?: boolean;
};

export default function BannerDisplay({ position, siteId, maxHeight = 80 }: { position: string; siteId?: string | number | null; maxHeight?: number }) {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let res: any;
        if (siteId) {
          res = await apiGet(`/sites/${siteId}/banners`);
          // API may return array or { data: [] }
          res = Array.isArray(res) ? res : (res?.data ?? []);
          res = (res as Banner[]).filter(b => b.position === position && b.active);
        } else {
          res = await apiGet(`/banners/${position}`);
          res = Array.isArray(res) ? res : (res?.data ?? []);
        }
        if (!mounted) return;
        setBanners(res as Banner[]);
      } catch (e) {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, [position, siteId]);

  if (!banners || banners.length === 0) return null;

  const b = banners[0];

  if (b.type === 'code') {
    return <Box sx={{ width: '100%', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: String(b.code_content ?? '') }} />;
  }

  if (b.image_url) {
    const img = <img src={b.image_url} alt={b.title} style={{ maxHeight: maxHeight, width: 'auto', display: 'block' }} />;
    if (b.link_url) return <Box component="a" href={b.link_url} target="_blank" rel="noopener noreferrer">{img}</Box>;
    return <Box>{img}</Box>;
  }

  return null;
}
