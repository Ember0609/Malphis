import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#6d28d9',
    },
    background: {
      default: '#0a0e1a',
      paper: '#111827',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(59, 130, 246, 0.35)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)',
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
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1225',
          borderRight: '1px solid rgba(59, 130, 246, 0.15)',
        },
      },
    },
  },
});

export default theme;
