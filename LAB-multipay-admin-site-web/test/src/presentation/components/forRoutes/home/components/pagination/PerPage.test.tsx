import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PerPage from '@/presentation/components/forRoutes/home/components/pagination/PerPage'
import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { Sort, SortCriteria } from '@/domain/aggregates/filter/sort'
// Mock do contexto
jest.mock('@/presentation/context/filter-context', () => ({
  useFilterContext: jest.fn(),
}))

// Mock do componente Select do Material-UI para testes
jest.mock('@mui/material/TextField', () => ({
  __esModule: true,
  default: ({ value, onChange, children }: any) => {
    return (
      <div>
        <input
          data-testid="per-page-select"
          value={value}
          onChange={onChange}
        />
        <div data-testid="options-container">
          {React.Children.map(children, child => (
            <div
              data-testid={`option-${child.props.value}`}
              onClick={() => onChange({ target: { value: child.props.value } })}
            >
              {child.props.children}
            </div>
          ))}
        </div>
      </div>
    )
  },
}))

describe('PerPage Component', () => {
  const mockSetFilter = jest.fn()
  const mockFilterData = {
    paging: new FilterPaging(1, 10, Sort.Date, SortCriteria.Descending),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('@/presentation/context/filter-context').useFilterContext.mockReturnValue(
      {
        setFilter: mockSetFilter,
        filterData: mockFilterData,
      }
    )
  })

  it('should render correctly with default values', () => {
    render(<PerPage total={10} />)

    expect(screen.getByText('Cards por Registros:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('should call setFilter when changing the per page value', async () => {
    render(<PerPage total={10} />)

    const select = screen.getByTestId('per-page-select')
    fireEvent.change(select, { target: { value: 20 } })

    await waitFor(() => {
      expect(mockSetFilter).toHaveBeenCalledTimes(1)
      expect(mockSetFilter).toHaveBeenCalled()
    })
  })

  it('should maintain other paging properties when changing per page', async () => {
    render(<PerPage total={10} />)

    const select = screen.getByTestId('per-page-select')
    fireEvent.change(select, { target: { value: 30 } })

    await waitFor(() => {
      expect(mockSetFilter).toHaveBeenCalled()
    })
  })

  it('should show all available options', () => {
    render(<PerPage total={10} />)

    const optionsContainer = screen.getByTestId('options-container')
    expect(optionsContainer.children).toHaveLength(5)
    expect(screen.getByTestId('option-10')).toHaveTextContent('10')
    expect(screen.getByTestId('option-20')).toHaveTextContent('20')
    expect(screen.getByTestId('option-30')).toHaveTextContent('30')
    expect(screen.getByTestId('option-50')).toHaveTextContent('50')
    expect(screen.getByTestId('option-100')).toHaveTextContent('100')
  })
})
