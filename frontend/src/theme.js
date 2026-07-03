import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#025B4D', // Custom primary color
    },
    background: {
      default: '#f5f5f5', // Light gray background
    },
    text: {
      primary: '#000000',
    },
  },
  typography: {
    fontFamily: ['"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#02483E', // Darker green on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
