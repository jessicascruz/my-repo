import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import BottomBarContent from '@/presentation/components/forRoutes/home/components/pagination/BottomBarContent'

describe('BottomBarContent', () => {
  const theme = createTheme()

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
  }

  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <BottomBarContent>
        <div>Test Child</div>
      </BottomBarContent>
    )
    expect(getByText('Test Child')).toBeInTheDocument()
  })

  it('applies correct flexbox styles', () => {
    const { container } = renderWithTheme(
      <BottomBarContent>
        <div>Test</div>
      </BottomBarContent>
    )
    const box = container.firstChild
    expect(box).toHaveStyle('display: flex')
    expect(box).toHaveStyle('justify-content: space-between')
    expect(box).toHaveStyle('align-items: center')
  })
})
