'use client'

import { Box } from '@mui/material'
import './index.css'
import Table from '@/presentation/components/forRoutes/home/components/table/Table'
import Toolbar from '@/presentation/components/forRoutes/home/components/toolbar/Toolbar'
import { BreadcrumbsComponent } from '../../common/breadcrumb'
import { useOrders } from '@/presentation/hooks/useOrders'

const HomePage: React.FC = () => {
  const { isLoading } = useOrders()

  return (
    <Box
      data-testid="home-page-container"
      sx={{
        background: '#F6F6F6',
        padding: '16px 0',
        minHeight: '100vh'
      }}
      role="main"
      aria-busy={isLoading}
    >
      <BreadcrumbsComponent />
      <Toolbar />
      <Table />
    </Box>
  )
}

export default HomePage
