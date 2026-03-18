import { render, screen, fireEvent } from '@testing-library/react'
import { InputField } from '../../../../src/domain/aggregates/input'
import { SxProps } from '@mui/material'

describe('InputField', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'Test Value',
    isLink: false,
    textFieldStyles: {} as SxProps,
  }

  it('renders with correct label and value', () => {
    render(<InputField {...defaultProps} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument()
  })

  it('applies custom styles to TextField', () => {
    const customStyles = { backgroundColor: 'red' } as SxProps
    render(<InputField {...defaultProps} textFieldStyles={customStyles} />)

    const inputWrapper = screen.getByDisplayValue('Test Value').parentElement
    expect(inputWrapper).toHaveStyle({ backgroundColor: 'red' })
  })

  it('opens link in new tab when clicked and isLink is true', () => {
    const mockOpen = jest.fn()
    window.open = mockOpen

    render(
      <InputField {...defaultProps} isLink={true} value="https://example.com" />
    )

    const textField = screen.getByDisplayValue('https://example.com')
    fireEvent.click(textField)

    expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank')
  })

  it('does not open link when clicked and isLink is false', () => {
    const mockOpen = jest.fn()
    window.open = mockOpen

    render(<InputField {...defaultProps} />)

    const textField = screen.getByDisplayValue('Test Value')
    fireEvent.click(textField)

    expect(mockOpen).not.toHaveBeenCalled()
  })

  it('applies correct cursor style based on isLink prop', () => {
    const { rerender } = render(<InputField {...defaultProps} />)

    // When isLink is false
    let textField = screen.getByDisplayValue('Test Value')
    expect(textField).toHaveStyle({ cursor: 'default' })

    // When isLink is true
    rerender(<InputField {...defaultProps} isLink={true} />)
    textField = screen.getByDisplayValue('Test Value')
    expect(textField).toHaveStyle({ cursor: 'pointer' })
  })

  it('applies correct hover color when isLink is true', () => {
    render(<InputField {...defaultProps} isLink={true} />)

    const inputElement = screen.getByDisplayValue('Test Value')

    // Simula hover no input
    fireEvent.mouseOver(inputElement)

    // Verifica a cor aplicada no hover
    expect(inputElement).toHaveStyle({ color: 'rgb(0, 80, 215)' })
  })

  it('displays label with correct styling', () => {
    render(<InputField {...defaultProps} />)

    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveStyle({ fontWeight: 600, marginBottom: 1 })
  })

  it('memoizes component when props are equal', () => {
    const { rerender } = render(<InputField {...defaultProps} />)
    const firstRender = screen.getByText('Test Label')

    // Re-render with same props
    rerender(<InputField {...defaultProps} />)
    const secondRender = screen.getByText('Test Label')

    // If memoization works, the elements should be the same instance
    expect(firstRender).toBe(secondRender)
  })

  it('re-renders when props change', () => {
    const { rerender } = render(<InputField {...defaultProps} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()

    // Re-render with different label
    rerender(<InputField {...defaultProps} label="New Label" />)
    expect(screen.getByText('New Label')).toBeInTheDocument()
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
  })
})
