import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material'
import { IItemResponse, IReceivableResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import Image from 'next/image'
import StatusBadge from '@/presentation/components/forRoutes/home/components/status/Status'
import { StatusType } from '@/domain/aggregates/status'
import { systemsOptions } from '@/domain/aggregates/options'
import { useQuery } from '@tanstack/react-query'
import { filterOptions } from '@/domain/seedWork/libs/reactQuery/options'
import { Filter } from '@/domain/aggregates/filter/filter'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import useLoaders from '@/presentation/hooks/useLoaders'
import VisibilityIcon from '@mui/icons-material/Visibility'

// Estilos células
const tableCellStyles = {
  fontWeight: 500,
  color: '#5D5D5D',
  p: 3,
}

// Estilos cabeçalho
const headerCellStyles = {
  fontWeight: 600,
  color: '#1F1F1F',
  borderBottom: '1px solid #E0E0E0',
  p: 3,
}

interface Props {
  data: IReceivableResponse
  searchLinks: IReceivableResponse[]
}

const DetailsButtonCell = ({
  id,
  searchParams,
}: {
  id: string
  searchParams: ReadonlyURLSearchParams
}) => {
  return (
    <div
      onClick={() => {
        window.open(`/order/${id}/details?${searchParams}`, '_blank')
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <IconButton
          color="primary"
          aria-label="Ver mais detalhes"
          title="Ver mais detalhes"
        >
          <VisibilityIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </div>
  )
}

const ReferencesForm = ({ data, searchLinks }: Props) => {
  const searchParams = useSearchParams()
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: '50vh',
        overflowY: 'auto',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#E7E7E7',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-horizontal': {
          height: '8px',
        },
      }}
    >
      <Table stickyHeader>
        {/* Head */}
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerCellStyles }}>Sub Referencia</TableCell>
            <TableCell sx={{ ...headerCellStyles }}>Status</TableCell>
            <TableCell sx={{ ...headerCellStyles }}>
              Sistema de origem
            </TableCell>
            <TableCell sx={{ ...headerCellStyles }}>Valor</TableCell>
            <TableCell sx={{ ...headerCellStyles }}>Ver Mais</TableCell>
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {searchLinks.map(link => {
            if (link.id === data.id) return null
            const system = systemsOptions.find(
              system => system.value === link.systemId
            )
            return (
              <TableRow key={link.id}>
                <TableCell sx={{ ...tableCellStyles }}>
                  {link.subReferenceId}
                </TableCell>

                <TableCell sx={{ ...tableCellStyles }}>
                  <StatusBadge status={link.status as StatusType} />
                </TableCell>

                <TableCell sx={{ ...tableCellStyles }}>
                  {system?.label} ({link.systemId})
                </TableCell>

                <TableCell sx={{ ...tableCellStyles }}>
                  {formatToBrlCurrency(link.amount)}
                </TableCell>

                <TableCell>
                  <DetailsButtonCell id={link.id} searchParams={searchParams} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReferencesForm
