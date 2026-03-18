import { CollapsableListAccordion } from '@/presentation/components/forRoutes/order/details/components/components/CollapsableListAccordion'
import { render, screen, fireEvent } from '@testing-library/react'

describe('CollapsableListAccordion', () => {
  const defaultProps = {
    title: 'Example Accordion',
    dataLength: 2,
    onChange: jest.fn(),
    children: <div>Accordion Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and badge when dataLength > 0', () => {
    render(<CollapsableListAccordion {...defaultProps} expanded={false} />)

    expect(screen.getByText('Example Accordion')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders image when imagePath is provided', () => {
    render(
      <CollapsableListAccordion
        {...defaultProps}
        expanded={false}
        imagePath="/example.png"
      />
    )

    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('example.png'))
    expect(image).toHaveAttribute('alt', 'Example Accordion')
  })

  it('calls onChange when accordion header is clicked', () => {
    render(<CollapsableListAccordion {...defaultProps} expanded={false} />)

    const summary = screen.getByText('Example Accordion')
    fireEvent.click(summary)

    expect(defaultProps.onChange).toHaveBeenCalledWith(true)
  })

  it('renders children when expanded is true', () => {
    render(<CollapsableListAccordion {...defaultProps} expanded={true} />)

    expect(screen.getByText('Accordion Content')).toBeInTheDocument()
  })

  it('does not render anything when dataLength is 0', () => {
    const { container } = render(
      <CollapsableListAccordion
        {...defaultProps}
        dataLength={0}
        expanded={false}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })
})
