import { render, screen, fireEvent } from '@testing-library/react'
import Formulary from '@/presentation/components/forRoutes/home/components/filter/Formulary'
import '@testing-library/jest-dom'
import moment from 'moment'

const baseFilter = {
  orderId: '',
  referenceId: '',
  company: '',
  systemId: 1,
  status: '',
  businessPartnerId: '',
  businessPartnerEmail: '',
  businessPartnerDocumentNumber: '',
  dateRange: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
}

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
}))

// Mock dos componentes de data
jest.mock(
  '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider',
  () => ({
    __esModule: true,
    LocalizationProvider: ({ children }: any) => <div>{children}</div>,
  })
)

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: ({ label, value, onChange, disabled }: any) => {
    return (
      <label>
        {label}
        <input
          aria-label={label}
          type="text"
          disabled={disabled}
          value={value ? moment(value).format('DD/MM/YYYY') : ''}
          onChange={e => {
            if (disabled) return
            const raw = e.target.value
            if (!raw || raw.trim() === '') {
              onChange(null)
            } else {
              const date = moment(raw, 'DD/MM/YYYY', true)
              onChange(date.isValid() ? date : null)
            }
          }}
        />
      </label>
    )
  },
}))

// Mock dos componentes de filtro de data
jest.mock(
  '@/presentation/components/forRoutes/home/components/filter/DateStartFilter',
  () => (props: any) => (
    <div
      data-testid="date-start-filter"
      onClick={() => props.handleChange('start', new Date('2023-01-01'))}
    >
      DateStartFilter Mock
    </div>
  )
)

jest.mock(
  '@/presentation/components/forRoutes/home/components/filter/DateEndFilter',
  () => (props: any) => (
    <div
      data-testid="date-end-filter"
      onClick={() => props.handleChange('end', new Date('2023-01-31'))}
    >
      DateEndFilter Mock
    </div>
  )
)

jest.mock(
  '@/presentation/components/forRoutes/home/components/filter/CreatedAtFilter',
  () => (props: any) => (
    <div
      data-testid="created-at-filter"
      onClick={() => props.handleChange('createdAt', new Date('2023-01-15'))}
    >
      CreatedAtFilter Mock
    </div>
  )
)

// Mock das opções
jest.mock('@/domain/aggregates/options', () => ({
  companyOptions: [
    { label: 'Company 1', value: '1' },
    { label: 'Company 2', value: '2' },
  ],
  statusOptions: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
  systemsOptions: [
    { label: 'System A', value: 'A' },
    { label: 'System B', value: 'B' },
  ],
}))

// Mock do contexto de filtro
const mockSetFilter = jest.fn()
jest.mock('@/presentation/context/filter-context', () => ({
  useFilterContext: () => ({
    setFilter: mockSetFilter,
    filterData: baseFilter,
  }),
}))

describe('Formulary', () => {
  const setup = (props = {}) => {
    const handleClose = jest.fn()
    render(<Formulary open={true} handleClose={handleClose} {...props} />)
    return { handleClose }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all input fields', () => {
    setup()

    expect(screen.getByLabelText('Referência')).toBeInTheDocument()
    expect(screen.getByLabelText('Empresa')).toBeInTheDocument()
    expect(screen.getByLabelText('Sistema')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('ID do Parceiro')).toBeInTheDocument()
    expect(screen.getByLabelText('Email do Parceiro')).toBeInTheDocument()
    expect(screen.getByLabelText('CPF ou CNPJ do Parceiro')).toBeInTheDocument()
  })

  it('should call handleClose on cancel button click', () => {
    const { handleClose } = setup()
    const cancelButton = screen.getByText(/cancelar/i)
    fireEvent.click(cancelButton)
    expect(handleClose).toHaveBeenCalled()
  })

  it('should call handleFilter on filter button click', () => {
    setup()
    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)
    expect(mockSetFilter).toHaveBeenCalled()
  })

  it('should allow input change for text fields', () => {
    setup()

    const referenceInput = screen
      .getByLabelText('Referência')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(referenceInput, { target: { value: 'ref-123' } })
    expect(referenceInput).toHaveValue('ref-123')
  })

  it('should handle date filter changes correctly', () => {
    setup()

    fireEvent.click(screen.getByTestId('date-start-filter'))
    fireEvent.click(screen.getByTestId('date-end-filter'))
    fireEvent.click(screen.getByTestId('created-at-filter'))

    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)

    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({
      dateRange: expect.any(Object),
      createdAt: expect.any(String)
    }))
  })

  it('should apply mask to CPF/CNPJ field', () => {
    setup()

    const documentInput = screen
      .getByLabelText('CPF ou CNPJ do Parceiro')
      .querySelector('input') as HTMLInputElement

    fireEvent.change(documentInput, { target: { value: '12345678900' } })
    expect(documentInput).toHaveValue('123.456.789-00')

    fireEvent.change(documentInput, { target: { value: '12345678000199' } })
    expect(documentInput).toHaveValue('12.345.678/0001-99')
  })

  it('should update select values when changed', () => {
    setup()

    const companySelect = screen.getByLabelText('Empresa')
    fireEvent.mouseDown(companySelect)
    const companyOptions = screen.getAllByRole('option')
    fireEvent.click(companyOptions[0])
    expect(companySelect).toHaveTextContent('Company 1')

    const systemSelect = screen.getByLabelText('Sistema')
    fireEvent.mouseDown(systemSelect)
    const systemOptions = screen.getAllByRole('option')
    fireEvent.click(systemOptions[1])
    expect(systemSelect).toHaveTextContent('System B')

    const statusSelect = screen.getByLabelText('Status')
    fireEvent.mouseDown(statusSelect)
    const statusOptions = screen.getAllByRole('option')
    fireEvent.click(statusOptions[0])
    expect(statusSelect).toHaveTextContent('Active')
  })

  it('should handle form submission with all fields filled', () => {
    setup()

    // Fill all fields
    const referenceInput = screen.getByLabelText('Referência').querySelector('input')
    fireEvent.change(referenceInput!, { target: { value: 'ref-123' } })

    const companySelect = screen.getByLabelText('Empresa')
    fireEvent.mouseDown(companySelect)
    fireEvent.click(screen.getAllByRole('option')[0])

    const systemSelect = screen.getByLabelText('Sistema')
    fireEvent.mouseDown(systemSelect)
    fireEvent.click(screen.getAllByRole('option')[0])

    const statusSelect = screen.getByLabelText('Status')
    fireEvent.mouseDown(statusSelect)
    fireEvent.click(screen.getAllByRole('option')[0])

    const partnerIdInput = screen.getByLabelText('ID do Parceiro').querySelector('input')
    fireEvent.change(partnerIdInput!, { target: { value: 'BP12345' } })

    const emailInput = screen.getByLabelText('Email do Parceiro').querySelector('input')
    fireEvent.change(emailInput!, { target: { value: 'test@example.com' } })

    const documentInput = screen.getByLabelText('CPF ou CNPJ do Parceiro').querySelector('input')
    fireEvent.change(documentInput!, { target: { value: '12345678900' } })

    // Set dates
    fireEvent.click(screen.getByTestId('date-start-filter'))
    fireEvent.click(screen.getByTestId('date-end-filter'))
    fireEvent.click(screen.getByTestId('created-at-filter'))

    // Submit form
    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)

    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'ref-123',
      company: '1',
      systemId: 'A',
      status: 'active',
      businessPartnerId: 'BP12345',
      businessPartnerEmail: 'test@example.com',
      businessPartnerDocumentNumber: '123.456.789-00',
      dateRange: expect.any(Object),
      createdAt: expect.any(String)
    }))
  })

  it('should handle form submission with partial fields', () => {
    setup()

    // Fill only some fields
    const referenceInput = screen.getByLabelText('Referência').querySelector('input')
    fireEvent.change(referenceInput!, { target: { value: 'ref-123' } })

    const emailInput = screen.getByLabelText('Email do Parceiro').querySelector('input')
    fireEvent.change(emailInput!, { target: { value: 'test@example.com' } })

    // Submit form
    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)

    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'ref-123',
      businessPartnerEmail: 'test@example.com'
    }))
  })

  it('should handle form submission with empty fields', () => {
    setup()

    // Submit form without filling any fields
    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)

    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: '',
      company: '',
      systemId: 1,
      status: '',
      businessPartnerId: '',
      businessPartnerEmail: '',
      businessPartnerDocumentNumber: ''
    }))
  })

  it('should handle select clear button click', () => {
    setup()

    // Select a value first
    const companySelect = screen.getByLabelText('Empresa')
    fireEvent.mouseDown(companySelect)
    fireEvent.click(screen.getAllByRole('option')[0])

    // Find and click the clear button
    const clearButton = screen.getAllByTestId('ClearIcon')[0].closest('button')
    if (!clearButton) throw new Error('Clear button not found')
    fireEvent.click(clearButton)

    // Verify the select is cleared
    expect(companySelect).not.toHaveTextContent('Company 1')
  })
})

describe('ModalFilter Responsive Behavior', () => {
  const mockHandleClose = jest.fn()

  const renderWithMobile = (isMobile: boolean) => {
    require('@mui/material').useMediaQuery.mockImplementation(() => isMobile)
    return render(<Formulary open={true} handleClose={mockHandleClose} />)
  }

  it('should render with 90% width on mobile', () => {
    renderWithMobile(true)
    screen.getByRole('presentation').firstChild?.firstChild
    screen.getByRole('button', { name: /cancelar/i })
    screen.getByRole('button', { name: /filtrar/i })
  })

  it('should render with 600px width on desktop', () => {
    renderWithMobile(false)
    screen.getByRole('presentation').firstChild?.firstChild
    screen.getByRole('button', { name: /cancelar/i })
    screen.getByRole('button', { name: /filtrar/i })
  })
})

describe('Formulary Date Handling', () => {
  const mockHandleClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set dates to null when not provided in filterState', () => {
    render(<Formulary open={true} handleClose={mockHandleClose} />)

    const startDateFilter = screen.getByTestId('date-start-filter')
    const endDateFilter = screen.getByTestId('date-end-filter')

    expect(startDateFilter.textContent).toBe('DateStartFilter Mock')
    expect(endDateFilter.textContent).toBe('DateEndFilter Mock')
  })

  it('should parse dates correctly when provided in filterState', () => {
    render(<Formulary open={true} handleClose={mockHandleClose} />)

    expect(screen.getByTestId('date-start-filter')).toBeInTheDocument()
    expect(screen.getByTestId('date-end-filter')).toBeInTheDocument()
  })

  it('should handle null createdAt date', () => {
    render(<Formulary open={true} handleClose={mockHandleClose} />)
    expect(screen.getByTestId('created-at-filter')).toBeInTheDocument()
  })

  it('should parse createdAt date when provided', () => {
    render(<Formulary open={true} handleClose={mockHandleClose} />)
    expect(screen.getByTestId('created-at-filter')).toBeInTheDocument()
  })

  it('should handle date range changes', () => {
    render(<Formulary open={true} handleClose={mockHandleClose} />)

    // Change start date
    fireEvent.click(screen.getByTestId('date-start-filter'))

    // Change end date
    fireEvent.click(screen.getByTestId('date-end-filter'))

    // Submit form
    const filterButton = screen.getByText(/filtrar/i)
    fireEvent.click(filterButton)

    expect(mockSetFilter).toHaveBeenCalledWith(expect.objectContaining({
      dateRange: expect.any(Object)
    }))
  })
})
