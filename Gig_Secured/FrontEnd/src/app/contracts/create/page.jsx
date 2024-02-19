"use client"
import Layout from '@/components/Layout'
import dynamic from 'next/dynamic'
import React from 'react'

const CreateContract = dynamic(() => import('@/features/contracts/createContract'), { ssr: false })

export default function page() {
  return (
    <Layout>
      <CreateContract />
    </Layout>
  )
}
