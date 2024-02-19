'use client';
import Layout from '@/components/Layout';
import React from 'react';
import CreateBecomeAuditor from '../../../features/audit/createBecomeAuditor';

export default function page() {
  return (
    <Layout>
      <CreateBecomeAuditor />
    </Layout>
  );
}
