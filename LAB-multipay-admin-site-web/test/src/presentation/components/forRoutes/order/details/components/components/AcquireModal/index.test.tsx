import { render, screen, fireEvent } from '@testing-library/react'
import { AcquirerModal } from '@/presentation/components/forRoutes/order/details/components/components/AcquirerModal'
import { IRefundAcquirer } from '@/domain/aggregates/order'

const mockAcquirer: IRefundAcquirer = {
    id: 123,
    description: 'Test Acquirer',
    paymentId: 'PAY-123',
    statusDetail: 'Approved',
    refundId: 'REF-123',
    status: 'APPROVED'
}

describe('AcquirerModal', () => {
    it('should render button with acquirer description', () => {
        render(<AcquirerModal acquirer={mockAcquirer} />)

        const button = screen.getByRole('button', { name: /Test Acquirer/i })
        expect(button).toBeInTheDocument()
    })

    it('should open modal when button is clicked', () => {
        render(<AcquirerModal acquirer={mockAcquirer} />)

        const button = screen.getByRole('button', { name: /Test Acquirer/i })
        fireEvent.click(button)

        expect(screen.getByText('Informações da Adquirente')).toBeInTheDocument()
    })

    it('should display all acquirer information in modal', () => {
        render(<AcquirerModal acquirer={mockAcquirer} />)

        const button = screen.getByRole('button', { name: /Test Acquirer/i })
        fireEvent.click(button)

        expect(screen.getByText('ID Adquirente')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()

        expect(screen.getByText('Descrição')).toBeInTheDocument()
        expect(screen.getByText('Test Acquirer', { selector: 'p' })).toBeInTheDocument()

        expect(screen.getByText('ID Pagamento')).toBeInTheDocument()
        expect(screen.getByText('PAY-123')).toBeInTheDocument()

        expect(screen.getByText('Status Detalhado')).toBeInTheDocument()
        expect(screen.getByText('Approved')).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', () => {
        render(<AcquirerModal acquirer={mockAcquirer} />)

        // Open modal
        const button = screen.getByRole('button', { name: /Test Acquirer/i })
        fireEvent.click(button)

        // Verify modal is open
        expect(screen.getByText('Informações da Adquirente')).toBeInTheDocument()

        // Close modal
        const closeButton = screen.getByTestId('CloseIcon').closest('button')
        if (!closeButton) throw new Error('Close button not found')
        fireEvent.click(closeButton)

        // Verify modal is closed
        expect(screen.queryByText('Informações da Adquirente')).not.toBeInTheDocument()
    })
})
