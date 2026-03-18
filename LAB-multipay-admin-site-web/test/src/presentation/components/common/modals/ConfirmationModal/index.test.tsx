import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationModal } from '@/presentation/components/common/modals/ConfirmationModal'

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and description when open', () => {
    render(<ConfirmationModal {...defaultProps} />)

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
  })

  it('renders children if provided', () => {
    render(
      <ConfirmationModal {...defaultProps}>
        <p>Child content here</p>
      </ConfirmationModal>
    )

    expect(screen.getByText('Child content here')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={false} />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when Confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)

    const confirmButton = screen.getByRole('button', { name: /confirmar/i })
    fireEvent.click(confirmButton)

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables buttons and shows loader when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    const confirmButton = screen.getByRole('progressbar').closest('button')

    expect(cancelButton).toBeDisabled()
    expect(confirmButton).toBeDisabled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('does not call onClose when loading and close attempted', () => {
    render(<ConfirmationModal {...defaultProps} isLoading />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when modal close button is clicked during loading', () => {
    render(<ConfirmationModal {...defaultProps} isLoading />)

    const closeButton = screen.getByTestId('CloseIcon').closest('button')
    if (!closeButton) throw new Error('Close button not found')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
