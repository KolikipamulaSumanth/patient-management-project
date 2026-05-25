import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#116466',
      dark: '#0b3f41',
      light: '#d5efed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c26f37',
      dark: '#8f4f24',
      light: '#f7d7bf',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d5b',
    },
    warning: {
      main: '#b26a00',
    },
    error: {
      main: '#b42318',
    },
    background: {
      default: '#f4f7f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#17252a',
      secondary: '#53666b',
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          background:
            'linear-gradient(135deg, rgba(17,100,102,0.08), rgba(194,111,55,0.08) 45%, rgba(255,255,255,0.94) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(23, 37, 42, 0.08)',
          boxShadow: '0 18px 48px rgba(23, 37, 42, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 38,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#53666b',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          backgroundColor: '#f8fbfa',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
