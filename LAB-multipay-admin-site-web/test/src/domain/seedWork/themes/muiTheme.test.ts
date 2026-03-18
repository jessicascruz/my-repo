import {
  muiTheme,
  ResponsiveStyleValue,
} from '@/domain/seedWork/themes/muiTheme'
import { ThemeOptions } from '@mui/material'
import { Breakpoint } from '@mui/material'

describe('muiTheme', () => {
  it('should be a valid MUI theme configuration', () => {
    expect(muiTheme).toBeDefined()
    expect(muiTheme).toHaveProperty('palette')
    expect(muiTheme).toHaveProperty('typography')
    expect(muiTheme).toHaveProperty('components')
  })

  describe('Palette', () => {
    it('should have correct primary colors', () => {
      expect(muiTheme.palette?.primary).toEqual({
        light: '#4691FF',
        main: '#0050D7',
        dark: '#0A2A61',
        contrastText: '#D4EFFF',
      })
    })

    it('should have correct secondary colors', () => {
      expect(muiTheme.palette?.secondary).toEqual({
        light: '#D8CCFF',
        main: '#5000BE',
        dark: '#2C007A',
        contrastText: '#D8CCFF',
      })
    })

    it('should have correct common colors', () => {
      expect(muiTheme.palette?.common).toEqual({
        white: '#FFFFFF',
        black: '#000000',
      })
    })

    it('should have correct error colors', () => {
      expect(muiTheme.palette?.error).toEqual({
        main: '#E51E2A',
        '100': '#FFE1E3',
        '200': '#FF6A73',
        '300': '#E51E2A',
        '400': '#48070B',
      })
    })

    it('should have correct success colors', () => {
      expect(muiTheme.palette?.success).toEqual({
        main: '#14C850',
        '100': '#D9FFE5',
        '200': '#14C850',
        '300': '#0F5829',
        '400': '#133607',
      })
    })

    it('should have correct background colors', () => {
      expect(muiTheme.palette?.background).toEqual({
        default: '#F6F6F6',
        paper: '#FFF',
      })
    })
  })

  describe('Typography', () => {
    const typography =
      typeof muiTheme.typography === 'function'
        ? muiTheme.typography({} as any)
        : muiTheme.typography

    it('should have correct font family', () => {
      expect(typography?.fontFamily).toBe('Inter, Arial')
    })

    it('should have correct base font size', () => {
      expect(typography?.fontSize).toBe(14)
    })

    it('should have correct body1 styles', () => {
      expect(typography?.body1).toEqual({
        fontSize: 14,
        color: '#3D3D3D',
      })
    })

    it('should have correct body2 styles', () => {
      expect(typography?.body2).toEqual({
        fontSize: 14,
        fontWeight: 600,
        color: '#3D3D3D',
      })
    })

    it('should have correct subtitle2 styles', () => {
      expect(typography?.subtitle2).toEqual({
        color: '#3D3D3D',
      })
    })

    it('should have correct font weights', () => {
      expect(typography?.fontWeightLight).toBe(300)
      expect(typography?.fontWeightRegular).toBe(500)
    })
  })

  describe('Components', () => {
    describe('MuiFab', () => {
      it('should have correct position styles', () => {
        expect(muiTheme.components?.MuiFab?.styleOverrides?.root).toEqual({
          position: 'fixed',
          bottom: '20px',
          right: '20px',
        })
      })
    })

    describe('MuiButton', () => {
      it('should have correct base styles', () => {
        expect(muiTheme.components?.MuiButton?.styleOverrides?.root).toEqual({
          textTransform: 'none',
          borderRadius: '100px',
          margin: '0px 5px',
          padding: '8px 16px',
        })
      })

      it('should have correct contained variant styles', () => {
        expect(
          muiTheme.components?.MuiButton?.styleOverrides?.contained
        ).toEqual({
          backgroundColor: '#0050D7',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#4691FF',
          },
          '&:disabled': {
            backgroundColor: '#D4EFFF',
            color: '#FFF',
          },
        })
      })

      it('should have correct outlined variant styles', () => {
        expect(
          muiTheme.components?.MuiButton?.styleOverrides?.outlined
        ).toEqual({
          borderColor: '#0050D7',
          color: '#0050D7',
          '&:hover': {
            borderColor: '#4691FF',
            color: '#4691FF',
          },
          '&:disabled': {
            borderColor: '#D4EFFF',
            color: '#D4EFFF',
          },
        })
      })
    })
  })

  describe('ResponsiveStyleValue Type', () => {
    it('should allow simple value', () => {
      const value: ResponsiveStyleValue<string> = 'test'
      expect(value).toBe('test')
    })

    it('should allow array value', () => {
      const value: ResponsiveStyleValue<string> = ['test', null, 'test2']
      expect(value).toEqual(['test', null, 'test2'])
    })

    it('should allow breakpoint object', () => {
      const value: ResponsiveStyleValue<string> = {
        xs: 'mobile',
        md: 'desktop',
        lg: null,
      }
      expect(value).toEqual({
        xs: 'mobile',
        md: 'desktop',
        lg: null,
      })
    })
  })
})
