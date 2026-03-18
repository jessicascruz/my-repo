import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '@/presentation/components/common/confirm-modal'

describe('ConfirmModal', () => {
    const defaultProps = {
        open: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with default props', () => {
        render(<ConfirmModal {...defaultProps} />)

        expect(screen.getByText('Atenção')).toBeInTheDocument()
        expect(screen.getByText('Você tem certeza que deseja realizar essa ação?')).toBeInTheDocument()
        expect(screen.getByText('Cancelar')).toBeInTheDocument()
        expect(screen.getByText('Confirmar')).toBeInTheDocument()
    })

    it('should render with custom title and message', () => {
        const customProps = {
            ...defaultProps,
            title: 'Custom Title',
            message: 'Custom Message',
        }

        render(<ConfirmModal {...customProps} />)

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByText('Custom Message')).toBeInTheDocument()
    })

    it('should call onClose when cancel button is clicked', () => {
        render(<ConfirmModal {...defaultProps} />)

        fireEvent.click(screen.getByText('Cancelar'))
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onConfirm when confirm button is clicked', () => {
        render(<ConfirmModal {...defaultProps} />)

        fireEvent.click(screen.getByText('Confirmar'))
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should show loading state and disable buttons when isLoading is true', () => {
        render(<ConfirmModal {...defaultProps} isLoading={true} />)

        const cancelButton = screen.getByText('Cancelar')
        const confirmButton = screen.getAllByRole('button')[1]

        expect(cancelButton).toBeDisabled()
        expect(confirmButton).toBeDisabled()
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should show loading spinner instead of text when isLoading is true', () => {
        render(<ConfirmModal {...defaultProps} isLoading={true} />)

        expect(screen.queryByText('Confirmar')).not.toBeInTheDocument()
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
        render(<ConfirmModal {...defaultProps} open={false} />)

        expect(screen.queryByText('Atenção')).not.toBeInTheDocument()
        expect(screen.queryByText('Você tem certeza que deseja realizar essa ação?')).not.toBeInTheDocument()
    })
})
