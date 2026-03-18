import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DefaultModal } from '@/presentation/components/common/modals'

describe('DefaultModal', () => {
  const title = 'Test Modal'
  const childrenText = 'This is modal content'
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(
      <DefaultModal isOpen onClose={onClose} title={title}>
        <p>{childrenText}</p>
      </DefaultModal>
    )

    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText(childrenText)).toBeInTheDocument()
  })

  it('does not render anything when isOpen is false', () => {
    const { queryByText } = render(
      <DefaultModal isOpen={false} onClose={onClose} title={title}>
        <p>{childrenText}</p>
      </DefaultModal>
    )

    expect(queryByText(title)).not.toBeInTheDocument()
    expect(queryByText(childrenText)).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <DefaultModal isOpen onClose={onClose} title={title}>
        <p>{childrenText}</p>
      </DefaultModal>
    )

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables the close button when disableCloseButton is true', () => {
    render(
      <DefaultModal isOpen onClose={onClose} title={title} disableCloseButton>
        <p>{childrenText}</p>
      </DefaultModal>
    )

    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeDisabled()
  })
})
