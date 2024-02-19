"use client"
import React from 'react'
import Layout from '@/components/Layout'
import dynamic from 'next/dynamic';

const AllContracts = dynamic(() => import('../../features/contracts/Contracts'), { ssr: false })

export default function page() {
  return (
    <Layout>
      <AllContracts />
    </Layout>
  )
}
