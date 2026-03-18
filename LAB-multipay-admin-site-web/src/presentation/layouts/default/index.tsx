'use client'
import Navbar from '@/presentation/components/common/header/Header'
import EnvironmentBanner from '@/presentation/components/common/environment-banner'
import React from 'react'
import { Bounce, ToastContainer } from 'react-toastify'
import GlobalProviders from './globalProviders/GlobalProviders'

const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  return (
    <GlobalProviders>
      <EnvironmentBanner />
      <Navbar />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </GlobalProviders>
  )
}

export default LayoutDefault
