"use client"
import React from 'react'
import Layout from '@/components/Layout'
import dynamic from 'next/dynamic';

const ViewContract = dynamic(() => import('@/features/contracts/viewContract'), { ssr: false })

export default function page() {
  return (
    <Layout>
      <ViewContract />
    </Layout>
  )
}
