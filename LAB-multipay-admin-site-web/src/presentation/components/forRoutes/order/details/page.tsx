'use client'

import Info from '@/presentation/components/forRoutes/components/info/Info'
import { Box } from '@mui/material'
import React from 'react'
import Details from '../../components/tabs/Tabs'
import { useOrderDetails } from '@/presentation/hooks/useOrderDetails'
import { useParams } from 'next/navigation'
import { BreadcrumbsComponent } from '@/presentation/components/common/breadcrumb'

const DetailsPage: React.FC = () => {
  const params = useParams()
  const { order } = useOrderDetails(params.id as string)

  return (
    order && (
      <Box sx={{ px: 1, background: '#F6F6F6' }}>
        <Info order={order} />
        <BreadcrumbsComponent />
        <Details order={order} />
      </Box>
    )
  )
}

export default DetailsPage
