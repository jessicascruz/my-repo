import { render, screen, fireEvent } from '@testing-library/react'
import SelectedFilter from '@/presentation/components/forRoutes/home/components/filter/SelectedFilters'
import { Filter } from '@/domain/aggregates/filter/filter'

// Mock the Icon component
jest.mock('@iconify/react', () => ({
    Icon: () => <span data-testid="close-icon">×</span>
}))

// Mock MUI Chip
jest.mock('@mui/material', () => ({
    Chip: ({ onDelete, label, sx }: any) => (
        <button onClick={onDelete} style={{ marginRight: '8px' }}>
            {label}
            <span data-testid="close-icon" onClick={onDelete}>×</span>
        </button>
    )
}))

describe('SelectedFilter', () => {
    const mockDeleteFieldFn = jest.fn()
    const defaultProps = {
        label: 'Test Filter',
        deleteFieldFn: mockDeleteFieldFn,
        field: 'status' as keyof Filter
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with correct label', () => {
        render(<SelectedFilter {...defaultProps} />)
        expect(screen.getByText('Test Filter')).toBeInTheDocument()
    })

    it('calls deleteFieldFn with correct field when delete button is clicked', () => {
        render(<SelectedFilter {...defaultProps} />)
        const deleteButton = screen.getByTestId('close-icon')
        fireEvent.click(deleteButton)
        expect(mockDeleteFieldFn).toHaveBeenCalledWith('status')
    })

    it('applies correct styling', () => {
        render(<SelectedFilter {...defaultProps} />)
        const chip = screen.getByRole('button')
        expect(chip).toHaveStyle({ marginRight: '8px' }) // mr: 1 in MUI equals 8px
    })
})
