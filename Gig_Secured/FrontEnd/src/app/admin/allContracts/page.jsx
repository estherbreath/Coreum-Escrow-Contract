'use client';
import React from 'react';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const RegisterContracts = dynamic(
  () => import('../../../features/contracts/RegisterContracts'),
  { ssr: false }
);

export default function page() {
  return (
    <Layout>
      <RegisterContracts />
    </Layout>
  );
}
