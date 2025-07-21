/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React from 'react'
import { Navbar } from '@/components/ui/navbar'
import Footer from '@/components/Footer'
import Homepage from './homepage/page'

export default function Home() {
  return (
    <>
      <Navbar />
      <Homepage />
      <Footer />
    </>
  )
}
