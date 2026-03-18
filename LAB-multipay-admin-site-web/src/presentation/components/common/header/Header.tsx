'use client'

import React, { useEffect, useState } from 'react'
import {
  AppBar,
  Box,
  Toolbar,
  Avatar,
} from '@mui/material'
import Image from 'next/image'

function ResponsiveAppBar() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div style={{ height: '64px' }} /> // Placeholder height for AppBar

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #E7E7E7',
        boxShadow: 'none',
        width: '100%',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          px: 2,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = '/')}
          >
            <Image
              src="/logo.svg"
              alt="Imagem externa"
              width={100}
              height={50}
              priority
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        </Box>

        {/* Avatar Simples */}
        <Avatar sx={{ width: 32, height: 32 }}>G</Avatar>
      </Toolbar>
    </AppBar>
  )
}

export default ResponsiveAppBar
