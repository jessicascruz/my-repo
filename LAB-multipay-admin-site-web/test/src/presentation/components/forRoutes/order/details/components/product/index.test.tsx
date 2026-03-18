import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductForm from '@/presentation/components/forRoutes/order/details/components/product/Product'
import { IItemResponse } from '@/domain/aggregates/order'

describe('ProductForm Component', () => {
  const mockData: IItemResponse[] = [
    {
      id: 'SKU123',
      quantity: 5,
      unitPrice: 19.99,
    },
    {
      id: 'SKU456',
      quantity: 2,
      unitPrice: 29.5,
    },
  ]

  it('should render the component with correct headers', () => {
    render(<ProductForm data={mockData} />)

    expect(screen.getByText('SKU')).toBeInTheDocument()
    expect(screen.getByText('Quantidade')).toBeInTheDocument()
    expect(screen.getByText('Preço Unitário')).toBeInTheDocument()
  })

  it('should display all product items correctly', () => {
    render(<ProductForm data={mockData} />)

    // Verifica se todos os itens são renderizados
    expect(screen.getByText('SKU123')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('R$ 19,99')).toBeInTheDocument()

    expect(screen.getByText('SKU456')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('R$ 29,50')).toBeInTheDocument()
  })

  it('should format currency correctly', () => {
    render(<ProductForm data={mockData} />)

    // Verifica a formatação de moeda
    expect(screen.getByText('R$ 19,99')).toBeInTheDocument()
    expect(screen.getByText('R$ 29,50')).toBeInTheDocument()
  })

  it('should render with empty data without errors', () => {
    render(<ProductForm data={[]} />)

    // Verifica se o cabeçalho ainda está presente
    expect(screen.getByText('SKU')).toBeInTheDocument()
    expect(screen.getByText('Quantidade')).toBeInTheDocument()
    expect(screen.getByText('Preço Unitário')).toBeInTheDocument()

    // Verifica que não há linhas de dados
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(1)
  })

  it('should apply correct styles to header cells', () => {
    render(<ProductForm data={mockData} />)

    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells[0]).toHaveStyle('font-weight: 600')
    expect(headerCells[0]).toHaveStyle('color: #1F1F1F')
    expect(headerCells[0]).toHaveStyle('border-bottom: 1px solid #E0E0E0')
  })

  it('should apply correct styles to body cells', () => {
    render(<ProductForm data={mockData} />)

    const bodyCells = screen.getAllByRole('cell')
    expect(bodyCells[0]).toHaveStyle('font-weight: 500')
    expect(bodyCells[0]).toHaveStyle('color: #5D5D5D')
  })

  it('should have scrollable container', () => {
    const { container } = render(<ProductForm data={mockData} />)

    const tableContainer = container.firstChild
    expect(tableContainer).toHaveStyle('max-height: 50vh')
    expect(tableContainer).toHaveStyle('overflow-y: auto')
    expect(tableContainer).toHaveStyle('overflow-x: auto')
  })
})
