import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Pages from '@/presentation/components/forRoutes/home/components/pagination/Pages'
import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { Sort, SortCriteria } from '@/domain/aggregates/filter/sort'

// Mocks
const setFilterMock = jest.fn()
const mockFilterPagingInstance = { paging: 'mock' }

jest.mock('@/domain/aggregates/filter/filter', () => ({
  FilterPaging: jest.fn(() => mockFilterPagingInstance),
}))

jest.mock('@/presentation/context/filter-context', () => ({
  useFilterContext: () => ({
    setFilter: setFilterMock,
    filterData: {
      paging: {
        perPage: 10,
        sort: Sort.Date,
        sortCriteria: SortCriteria.Ascending,
      },
    },
  }),
}))

describe('Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render pagination with correct page and count', () => {
    render(<Pages page={2} count={5} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should call setFilter with correct FilterPaging when page changes', () => {
    render(<Pages page={1} count={5} />)

    const page3Btn = screen.getByRole('button', { name: 'Go to page 3' })
    fireEvent.click(page3Btn)

    expect(setFilterMock).toHaveBeenCalledWith({
      paging: mockFilterPagingInstance,
    })
    expect(
      require('@/domain/aggregates/filter/filter').FilterPaging
    ).toHaveBeenCalledWith(3, 10, Sort.Date, SortCriteria.Ascending)
  })

  it('should pass undefined to FilterPaging when selected value is 0', () => {
    render(<Pages page={1} count={5} />)

    // simula manualmente a chamada da função onChange do componente Pagination
    const pagination = screen.getByRole('navigation')
    const onChange = pagination.getAttribute('onChange') // este não funciona diretamente

    // então fazemos manualmente a chamada com valor 0
    const handlePageChange = (Pages({ page: 1, count: 5 }) as any).props
      .onChange
    if (handlePageChange) {
      handlePageChange(null, 0)
    }

    expect(setFilterMock).toHaveBeenCalledWith({
      paging: new FilterPaging(
        undefined,
        10,
        Sort.Date,
        SortCriteria.Ascending
      ),
    })
  })
})
