import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B0B0F',
      paper: '#12121A',
    },
    primary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#6D28D9',
      contrastText: '#F8FAFC',
    },
    secondary: {
      main: '#06B6D4',
      light: '#22D3EE',
      dark: '#0891B2',
    },
    error: {
      main: '#F43F5E',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    divider: 'rgba(148, 163, 184, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, color: '#94A3B8' },
    body2: { color: '#94A3B8' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B0B0F',
          scrollbarWidth: 'thin',
          scrollbarColor: '#1E1E2E #0B0B0F',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#12121A',
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(124, 58, 237, 0.1)',
          boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(124, 58, 237, 0.05)',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(124, 58, 237, 0.1)',
            borderColor: 'rgba(124, 58, 237, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
          boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.5)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
            boxShadow: '0 6px 20px -2px rgba(124, 58, 237, 0.6)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(11, 11, 15, 0.6)',
            '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(124, 58, 237, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
          padding: '14px 16px',
        },
        head: {
          fontWeight: 600,
          color: '#64748B',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#12121A',
          backgroundImage: 'none',
          borderRadius: 16,
          border: '1px solid rgba(124, 58, 237, 0.15)',
          boxShadow: '0 0 40px rgba(124, 58, 237, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0B0B0F',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(148, 163, 184, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 11, 15, 0.85)',
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default muiTheme;
