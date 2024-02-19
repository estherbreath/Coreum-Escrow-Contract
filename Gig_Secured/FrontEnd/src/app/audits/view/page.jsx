'use client';
import React from 'react';
import Layout from '@/components/Layout';
import ViewAudit from '../../../features/audit/viewAudits';

export default function page() {
  return (
    <Layout>
      <ViewAudit />
    </Layout>
  );
}
