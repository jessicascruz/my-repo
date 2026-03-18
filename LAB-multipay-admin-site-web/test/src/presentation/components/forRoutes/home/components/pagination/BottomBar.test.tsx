// BottomBar.test.tsx
import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import BottomBar from '@/presentation/components/forRoutes/home/components/pagination/BottomBar'

describe('BottomBar', () => {
  const theme = createTheme()

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
  }

  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <BottomBar>
        <div>Child Content</div>
      </BottomBar>
    )
    expect(getByText('Child Content')).toBeInTheDocument()
  })

  it('applies fixed position when isFixed is true (default)', () => {
    const { container } = renderWithTheme(
      <BottomBar>
        <div>Test</div>
      </BottomBar>
    )
    expect(container.firstChild).toHaveStyle('position: fixed')
  })

  it('applies relative position when isFixed is false', () => {
    const { container } = renderWithTheme(
      <BottomBar isFixed={false}>
        <div>Test</div>
      </BottomBar>
    )
    expect(container.firstChild).toHaveStyle('position: relative')
  })

  it('has background color from theme', () => {
    const { container } = renderWithTheme(
      <BottomBar>
        <div>Color Test</div>
      </BottomBar>
    )
    const box = container.firstChild
    expect(box).toHaveStyle(`background-color: ${theme.palette.common.white}`)
  })
})
