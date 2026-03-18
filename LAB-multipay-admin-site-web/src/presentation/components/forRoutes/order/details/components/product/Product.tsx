import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { IItemResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import Image from 'next/image'

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
  data: IItemResponse[]
}

const ProductForm = ({ data }: Props) => {
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
            <TableCell sx={{ ...headerCellStyles, width: '10%' }}>
              Imagem
            </TableCell>
            <TableCell sx={{ ...headerCellStyles, width: '15%' }}>
              SKU
            </TableCell>
            <TableCell sx={{ ...headerCellStyles, width: '35%' }}>
              Nome
            </TableCell>
            <TableCell sx={{ ...headerCellStyles, width: '15%' }}>
              Quantidade
            </TableCell>
            <TableCell sx={{ ...headerCellStyles, width: '20%' }}>
              Preço Unitário
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {data.map((value, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell sx={{ ...tableCellStyles, width: '10%' }}>
                <Image
                  src={value.image || process.env.NEXT_PUBLIC_NO_IMAGE!}
                  alt={value.name}
                  width={60}
                  height={60}
                />
              </TableCell>
              <TableCell sx={{ ...tableCellStyles, width: '15%' }}>
                {value.id}
              </TableCell>
              <TableCell sx={{ ...tableCellStyles, width: '40%' }}>
                {value.name}
              </TableCell>
              <TableCell sx={{ ...tableCellStyles, width: '15%' }}>
                {value.quantity}
              </TableCell>
              <TableCell sx={{ ...tableCellStyles, width: '20%' }}>
                {formatToBrlCurrency(value.unitPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProductForm
