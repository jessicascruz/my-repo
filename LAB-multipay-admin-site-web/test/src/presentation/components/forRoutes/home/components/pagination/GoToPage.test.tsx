import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GoToPage from '@/presentation/components/forRoutes/home/components/pagination/GoToPage'

// Mock da função isNumber
jest.mock('@/domain/seedWork/validators/isNumber', () => ({
  isNumber: jest.fn(),
}))

// Mock da classe FilterPaging
const mockFilterPagingInstance = { mock: 'pagingInstance' }
jest.mock('@/domain/aggregates/filter/filter', () => ({
  FilterPaging: jest.fn().mockImplementation(() => mockFilterPagingInstance),
}))

// Mock do useFilterContext
const setFilterMock = jest.fn()
jest.mock('@/presentation/context/filter-context', () => ({
  useFilterContext: () => ({
    setFilter: setFilterMock,
    filterData: {
      paging: {
        perPage: 10,
        sort: 'asc',
        sortCriteria: 'name',
      },
    },
  }),
}))

// Import após mocks
import { isNumber } from '@/domain/seedWork/validators/isNumber'
import { FilterPaging } from '@/domain/aggregates/filter/filter'

describe('GoToPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render label and input', () => {
    render(<GoToPage />)
    expect(screen.getByText('Ir para página:')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should call setFilter on blur when input is a valid number', () => {
    ;(isNumber as jest.Mock).mockReturnValue(true)

    render(<GoToPage />)

    const input = screen.getByRole('textbox')
    fireEvent.blur(input, { target: { value: '5' } })

    expect(isNumber).toHaveBeenCalledWith('5')
    expect(FilterPaging).toHaveBeenCalledWith(5, 10, 'asc', 'name')
    expect(setFilterMock).toHaveBeenCalledWith({
      paging: mockFilterPagingInstance,
    })
  })

  it('should not call setFilter if input is not a number', () => {
    ;(isNumber as jest.Mock).mockReturnValue(false)

    render(<GoToPage />)

    const input = screen.getByRole('textbox')
    fireEvent.blur(input, { target: { value: 'abc' } })

    expect(isNumber).toHaveBeenCalledWith('abc')
    expect(setFilterMock).not.toHaveBeenCalled()
  })

  it('should call handleChangeGoToPage when Enter is pressed', () => {
    ;(isNumber as jest.Mock).mockReturnValue(true)

    render(<GoToPage />)

    const input = screen.getByRole('textbox')
    fireEvent.keyUp(input, {
      key: 'Enter',
      target: { value: '3' },
    })

    expect(isNumber).toHaveBeenCalledWith('3')
    expect(FilterPaging).toHaveBeenCalledWith(3, 10, 'asc', 'name')
    expect(setFilterMock).toHaveBeenCalledWith({
      paging: mockFilterPagingInstance,
    })
  })

  it('should pass undefined to FilterPaging when value is 0', () => {
    ;(isNumber as jest.Mock).mockReturnValue(true)

    render(<GoToPage />)

    const input = screen.getByRole('textbox')
    fireEvent.blur(input, { target: { value: '0' } })

    // O primeiro argumento vira undefined por causa do +value || undefined
    expect(FilterPaging).toHaveBeenCalledWith(undefined, 10, 'asc', 'name')

    expect(setFilterMock).toHaveBeenCalledWith({
      paging: mockFilterPagingInstance,
    })
  })
})
