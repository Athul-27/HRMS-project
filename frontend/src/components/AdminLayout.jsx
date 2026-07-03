import React, { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PaidIcon from "@mui/icons-material/Paid";
import EventIcon from "@mui/icons-material/Event";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin-dashboard" },
  {
    text: "Employees",
    icon: <PeopleIcon />,
    subItems: [
      { text: "Add Employee", path: "/admin-dashboard/add-employee" },
      { text: "View Employees", path: "/admin-dashboard/employees" },
    ],
  },
  {
    text: "Leave Approvals",
    icon: <EventIcon />,
    path: "/admin-dashboard/leave-approval",
  },
  {
    text: "Payroll",
    icon: <PaidIcon />,
    path: "/admin-dashboard/payroll",
  },
  // {
  //   text: "Reports",
  //   icon: <AssessmentIcon />,
  //   path: "/admin-dashboard/reports",
  // },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openEmployees, setOpenEmployees] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEmployeeClick = () => {
    setOpenEmployees(!openEmployees);
  };

  const handleNavigation = (path) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      navigate(path);
      setMobileOpen(false);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        background: "#025b4d",
        color: "white",
      }}
    >
      <Toolbar
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(90deg, #FFFFFF 0%, #EEEEEE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          HRMS ADMIN
        </Typography>
      </Toolbar>

      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
              onClick={
                item.subItems
                  ? handleEmployeeClick
                  : () => handleNavigation(item.path)
              }
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              {item.subItems &&
                (openEmployees ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
            </ListItem>

            {item.subItems && (
              <Collapse in={openEmployees} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      key={subItem.text}
                      button
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        pl: 6,
                        borderRadius: 1,
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{ fontSize: "0.9rem" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1 }} />
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            "&:hover": {
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#025B4D",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
