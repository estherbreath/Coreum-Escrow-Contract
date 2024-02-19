import React from 'react';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const Freelances = dynamic(() => import('../../features/freelances/freelance'), { ssr: false })

export default function page() {
  return (
    <Layout>
      <Freelances />
    </Layout>
  );
}
