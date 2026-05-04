import React from 'react';
import CategoriesManager from '@/components/dashboard/CategoriesManager';
import AdminLayout from '@/components/AdminLayout';
import type { GetServerSideProps } from 'next';

export default function CategoriesPage({ siteId }: { siteId: string }) {
  const currentSiteId = siteId ? Number(siteId) : undefined;
  return (
    <AdminLayout currentSiteId={currentSiteId}>
      <CategoriesManager siteId={siteId} />
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  return { props: { siteId: String(id ?? '') } };
};
