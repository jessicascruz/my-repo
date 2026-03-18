import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { ReactNode } from 'react'

interface Props {
  headers: string[]
  children: ReactNode[]
}

export const CollapsableListTable = ({ headers, children }: Props) => {
  return (
    <TableContainer component="div" sx={{ mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map(header => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  )
}
