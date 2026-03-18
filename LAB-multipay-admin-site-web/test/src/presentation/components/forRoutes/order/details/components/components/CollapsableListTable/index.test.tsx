import { render, screen } from '@testing-library/react'
import { TableRow, TableCell } from '@mui/material'
import { CollapsableListTable } from '@/presentation/components/forRoutes/order/details/components/components/CollapsableListTable'

describe('CollapsableListTable', () => {
  const headers = ['ID', 'Name', 'Email']

  const mockRows = [
    <TableRow key="1">
      <TableCell>1</TableCell>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>,
    <TableRow key="2">
      <TableCell>2</TableCell>
      <TableCell>Jane Smith</TableCell>
      <TableCell>jane@example.com</TableCell>
    </TableRow>,
  ]

  it('renders table headers correctly', () => {
    render(<CollapsableListTable headers={headers} children={mockRows} />)

    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument()
    })
  })

  it('renders children rows correctly', () => {
    render(<CollapsableListTable headers={headers} children={mockRows} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })
})
