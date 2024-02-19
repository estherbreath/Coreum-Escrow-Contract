import React from 'react';
import Layout from '@/components/Layout';
import AdminDash from '../../features/admin/adminDash';

export default function page() {
  return (
    <Layout>
      <AdminDash />
    </Layout>
  );
}
