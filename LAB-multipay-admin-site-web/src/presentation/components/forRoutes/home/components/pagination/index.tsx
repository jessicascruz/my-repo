import Box from '@mui/material/Box'
import React, { ReactNode } from 'react'
import BottomBar from './BottomBar'
import BottomBarContent from './BottomBarContent'
import PerPage from './PerPage'
import Pages from './Pages'
import GoToPage from './GoToPage'

interface Props {
  perPage?: ReactNode
  pages?: ReactNode
  goToPage?: ReactNode
}

const Pagination = ({ perPage, pages, goToPage }: Props) => {
  return (
    <BottomBar>
      <BottomBarContent>
        <Box>{perPage}</Box>
        <Box>{pages}</Box>
        <Box>{goToPage}</Box>
      </BottomBarContent>
    </BottomBar>
  )
}

Pagination.PerPage = PerPage
Pagination.Pages = Pages
Pagination.GoToPage = GoToPage

export default Pagination
