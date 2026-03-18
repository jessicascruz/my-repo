import { Breakpoint, ThemeOptions } from '@mui/material'
import '@mui/x-data-grid/themeAugmentation'

export type ResponsiveStyleValue<T> =
  | T
  | Array<T | null>
  | {
    [key in Breakpoint]?: T | null
  }

export const muiTheme: ThemeOptions = {
  palette: {
    primary: {
      light: '#4691FF',
      main: '#0050D7',
      dark: '#0A2A61',
      contrastText: '#D4EFFF',
    },
    secondary: {
      light: '#D8CCFF',
      main: '#5000BE',
      dark: '#2C007A',
      contrastText: '#D8CCFF',
    },
    common: {
      white: '#FFFFFF',
      black: '#000000',
    },
    error: {
      main: '#E51E2A',
      '100': '#FFE1E3',
      '200': '#FF6A73',
      '300': '#E51E2A',
      '400': '#48070B',
    },
    success: {
      main: '#14C850',
      '100': '#D9FFE5',
      '200': '#14C850',
      '300': '#0F5829',
      '400': '#133607',
    },
    warning: {
      main: '#FDB014',
      '100': '#FFFAEB',
      '200': '#FFF0C6',
      '300': '#FDB014',
      '400': '#B64A07',
    },
    background: {
      default: '#F6F6F6',
      paper: '#FFF',
    },
  },
  typography: {
    body1: {
      fontSize: 14,
      color: '#3D3D3D',
    },
    subtitle2: {
      color: '#3D3D3D',
    },
    body2: {
      fontSize: 14,
      fontWeight: 600,
      color: '#3D3D3D',
    },
    fontFamily: 'Inter, Arial',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 500,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Inter';
        }
      `,
    },
    MuiFab: {
      styleOverrides: {
        root: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '100px',
          margin: '0px 5px',
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: '#0050D7',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#4691FF',
          },
          '&:disabled': {
            backgroundColor: '#D4EFFF',
            color: '#FFF',
          },
        },
        outlined: {
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
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px',
          fontSize: '14px',
          fontWeight: 400,
          color: '#3D3D3D',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F6F6',
          fontSize: '14px',
          color: '#3D3D3D',
          whiteSpace: 'nowrap',
          '& .MuiTableCell-root': {
            fontWeight: 600,
            borderLeft: '1px solid #D1D1D1',
          },
          '& .MuiTableCell-root:first-child': {
            borderLeft: 'none',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#E7E7E7',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#5D5D5D',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: '1px solid #E0E0E0',
          borderRadius: '2px',
          backgroundColor: '#FFFFFF',
          marginBottom: '60px',
          '& .MuiDataGrid-columnHeaderTitle': {
            backgroundColor: '#F6F6F6',
            color: '#000',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            backgroundColor: '#FFFFFF',
            color: '#5D5D5D',
            fontWeight: '400',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#F0F0F0',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#FFFFFF',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        },
      },
    },
  },
}
