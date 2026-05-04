import React from 'react';
import CategoriesManager from '@/components/dashboard/CategoriesManager';
import type { GetServerSideProps } from 'next';

export default function CategoriesPage({ siteId }: { siteId: string }) {
  return <CategoriesManager siteId={siteId} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;
  return { props: { siteId: String(id ?? '') } };
};
