import { muiTheme } from '@/domain/seedWork/themes/muiTheme';
import { createTheme, ThemeProvider } from '@mui/material';
import React, { ReactNode } from 'react';
interface Props {
  children: ReactNode;
}
const MuiThemeProvider = ({ children }: Props) => {
  const theme = createTheme(muiTheme);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MuiThemeProvider;
