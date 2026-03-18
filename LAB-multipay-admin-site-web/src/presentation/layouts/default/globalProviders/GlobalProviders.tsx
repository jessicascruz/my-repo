'use client'
import { LoaderProvider } from '@/presentation/providers/LoaderProvider'
import MuiThemeProvider from '@/presentation/providers/MuiThemeProvider'
import ReactQueryProvider from '@/presentation/providers/ReactQueryProvider'
import { ConfigProvider } from 'antd'
import React from 'react'

const GlobalProviders = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <LoaderProvider>
      <MuiThemeProvider>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'Inter, Arial',
            },
          }}
        >
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ConfigProvider>
      </MuiThemeProvider>
    </LoaderProvider>
  )
}

export default GlobalProviders
