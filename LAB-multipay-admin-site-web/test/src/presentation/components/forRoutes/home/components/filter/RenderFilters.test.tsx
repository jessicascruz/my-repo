import { render, screen, fireEvent } from '@testing-library/react'
import { FilterContext } from '@/presentation/context/filter-context'
import RenderFilters from '@/presentation/components/forRoutes/home/components/filter/RenderFilters'
import moment from 'moment'
import { Filter } from '@/domain/aggregates/filter/filter'
import { DateRange } from '@/domain/aggregates/filter/dateRange'

jest.mock('@/presentation/components/forRoutes/home/components/filter/SelectedFilters', () => ({
    __esModule: true,
    default: ({ label, deleteFieldFn, field }: any) => (
        <button onClick={() => deleteFieldFn(field)}>{label}</button>
    ),
}))

const mockSetFilter = jest.fn()
const mockHandleClearFilter = jest.fn()

const renderWithContext = (filterData: Partial<Filter>, isEmptyFilter = false) => {
    return render(
        <FilterContext.Provider
            value={{
                filterData: filterData as Filter,
                setFilter: mockSetFilter,
                isEmptyFilter,
                handleClearFilter: mockHandleClearFilter,
            }}
        >
            <RenderFilters />
        </FilterContext.Provider>
    )
}

describe('RenderFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render anything when filters are empty', () => {
        renderWithContext({}, true)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render date range filter correctly', () => {
        const startDate = '2024-03-20'
        const endDate = '2024-03-25'
        const dateRange = new DateRange(startDate, endDate)
        renderWithContext({
            dateRange,
        })

        const expectedLabel = `${moment(startDate).format('DD/MM/YYYY')} até ${moment(endDate).format('DD/MM/YYYY')}`
        expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })

    it('should render order ID filter correctly', () => {
        renderWithContext({
            orderId: '12345',
        })

        expect(screen.getByText('ID: 12345')).toBeInTheDocument()
    })

    it('should render company filter correctly', () => {
        renderWithContext({
            company: 'company1',
        })

        // Note: This test assumes companyOptions has a matching value
        expect(screen.getByText(/Compania:/)).toBeInTheDocument()
    })

    it('should handle filter removal', () => {
        const filterData = {
            orderId: '12345',
            company: 'company1',
        } as Filter

        renderWithContext(filterData)

        const removeButtons = screen.getAllByRole('button')
        fireEvent.click(removeButtons[0]) // Click first remove button

        const newFilter = { ...filterData }
        delete newFilter.orderId
        expect(mockSetFilter).toHaveBeenCalledWith(newFilter)
    })

    it('should render multiple filters simultaneously', () => {
        const filterData = {
            orderId: '12345',
            referenceId: 'REF123',
            status: 'active',
        }

        renderWithContext(filterData)

        expect(screen.getByText('ID: 12345')).toBeInTheDocument()
        expect(screen.getByText('Referência: REF123')).toBeInTheDocument()
        expect(screen.getByText(/Status:/)).toBeInTheDocument()
    })

    it('should format business partner filters correctly', () => {
        const filterData = {
            businessPartnerId: 'BP123',
            businessPartnerEmail: 'partner@example.com',
            businessPartnerDocumentNumber: '123.456.789-00',
        }

        renderWithContext(filterData)

        expect(screen.getByText('ID do Parceiro: BP123')).toBeInTheDocument()
        expect(screen.getByText('Email do Parceiro: partner@example.com')).toBeInTheDocument()
        expect(screen.getByText('CPF ou CNPJ do Parceiro: 123.456.789-00')).toBeInTheDocument()
    })
})
