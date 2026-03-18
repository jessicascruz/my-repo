import React from 'react'
import { render, screen } from '@testing-library/react'
import StickyHeadTable from '@/presentation/components/forRoutes/home/components/table/Table'
import { useFilterContext } from '@/presentation/context/filter-context'
import { useOrders } from '@/presentation/hooks/useOrders'
import { useSearchParams } from 'next/navigation'
import { StatusType } from '@/domain/aggregates/status'
import { mockOrder } from '../../../../../../../mocked-order' 

jest.mock('@/presentation/context/filter-context')
jest.mock('@/presentation/hooks/useOrders')
jest.mock('next/navigation')
jest.mock('@iconify/react/dist/iconify.js', () => ({
  Icon: ({ icon, color }: { icon: string; color: string }) => (
    <span data-testid="icon" data-icon={icon} data-color={color} />
  ),
}))
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  IconButton: ({ children, onClick, 'data-testid': testId, title }: any) => (
    <button onClick={onClick} data-testid={testId} title={title}>
      {children}
    </button>
  ),
  Box: ({ children, sx }: any) => <div style={sx}>{children}</div>,
}))
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, localeText }: any) => {
    const renderCell = (col: any, row: any) => {
      if (col.valueFormatter) {
        return col.valueFormatter(row[col.field])
      }
      if (col.renderCell) {
        return col.renderCell({ value: row[col.field], row })
      }
      return row[col.field]
    }

    return (
      <div data-testid="data-grid">
        {rows.length === 0 ? (
          <div>{localeText.noRowsLabel}</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((col: any) => (
                  <th key={col.field}>{col.headerName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id}>
                  {columns.map((col: any) => (
                    <td key={`${row.id}-${col.field}`}>
                      {renderCell(col, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  },
}))

const mockOrders = [
  {
    ...mockOrder,
    label: 'Payment Link',
  },
]

const mockFilterData = {
  paging: {
    page: 1,
    perPage: 10,
    sort: 'asc',
    sortCriteria: 'createdAt',
  },
}

describe('StickyHeadTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFilterContext as jest.Mock).mockReturnValue({
      filterData: mockFilterData,
      setFilter: jest.fn(),
    })
    ;(useOrders as jest.Mock).mockReturnValue({
      orders: mockOrders,
      paging: { total: 100, perPage: 10 },
      isLoading: false,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  it('renders the table with orders when filter data is present', () => {
    render(<StickyHeadTable />)

    expect(screen.getByTestId('data-grid')).toBeInTheDocument()
    expect(screen.getByText('ref-1')).toBeInTheDocument()
    expect(screen.getByText('MULTI (MULTI)')).toBeInTheDocument()
  })

  it('shows loading state when orders are being fetched', () => {
    ;(useOrders as jest.Mock).mockReturnValue({
      orders: [],
      paging: { total: 0, perPage: 10 },
      isLoading: true,
    })

    render(<StickyHeadTable />)

    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
  })

  it('shows no data message when no orders are found', () => {
    ;(useOrders as jest.Mock).mockReturnValue({
      orders: [],
      paging: { total: 0, perPage: 10 },
      isLoading: false,
    })

    render(<StickyHeadTable />)

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument()
  })

  it('renders copy button for payment link', () => {
    render(<StickyHeadTable />)

    const copyButton = screen.getByTestId('copy-button')
    expect(copyButton).toBeInTheDocument()
  })

  it('renders details button for each order', () => {
    render(<StickyHeadTable />)

    const detailsButton = screen.getByRole('button', { name: 'Ver mais detalhes' })
    expect(detailsButton).toBeInTheDocument()
  })

  it('does not render table when filter data is empty', () => {
    ;(useFilterContext as jest.Mock).mockReturnValue({
      filterData: {},
      setFilter: jest.fn(),
    })

    const { container } = render(<StickyHeadTable />)

    expect(container).toBeEmptyDOMElement()
  })

  it('formats currency values correctly', () => {
    render(<StickyHeadTable />)

    expect(screen.getByText('R$ 100,50')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    render(<StickyHeadTable />)

    expect(screen.getByText('01/01/2023 00:00:00')).toBeInTheDocument()
  })
})
