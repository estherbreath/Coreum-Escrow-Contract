"use client"
import React, { useEffect } from 'react'
import SideBar from './SideBar'
import AppProvider from '@/app/auth/Context'
import Auth from '@/app/auth/Auth'
import { useRouter } from 'next/navigation'

export default function Layout({ children }) {
  const router = useRouter()
  return (
    <main className='bg-white'>
      <section className="h-screen flex">
        <SideBar />
        <div className="w-[100%] min-h-screen overflow-y-scroll max-h-screen overflow-scrollable px-6">
          {children}
        </div>
      </section >
    </main >
  )
}
