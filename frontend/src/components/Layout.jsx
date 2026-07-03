import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Paid as PaidIcon,
  AccountTree as AccountTreeIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/admin/employees' },
  { text: 'Payroll', icon: <PaidIcon />, path: '/admin/payroll' },
  { text: 'Leave Requests', icon: <EventIcon />, path: '/admin/leave-approval' },
  { text: 'Projects', icon: <AccountTreeIcon />, path: '/admin/projects' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
];

const Layout = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          backgroundColor: theme.palette.primary.main,
          transition: 'width 0.3s ease',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map(({ text, icon, path }) => (
            <ListItem button key={text} onClick={() => navigate(path)}>
              <ListItemIcon sx={{ color: '#fff' }}>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet /> {/* ⬅️ This will render child route pages */}
      </Box>
    </Box>
  );
};

export default Layout;
