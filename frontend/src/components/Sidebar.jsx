import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const Sidebar = () => {
  const [openEmployees, setOpenEmployees] = useState(false);

  const handleEmployeeClick = () => {
    setOpenEmployees(!openEmployees);
  };

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button component={Link} to="/admin-dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>

        {/* Employees Section with Dropdown */}
        <ListItem button onClick={handleEmployeeClick}>
          <ListItemText primary="Employees" />
          {openEmployees ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>

        <Collapse in={openEmployees} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              to="/admin-dashboard/employees/add"
            >
              <ListItemText primary="Add Employee" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/admin-dashboard/employees/view"
            >
              <ListItemText primary="View Employees" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button component={Link} to="/admin-dashboard/payroll">
          <ListItemText primary="Payroll" />
        </ListItem>
        <ListItem button component={Link} to="/admin-dashboard/attendance">
          <ListItemText primary="Attendance" />
        </ListItem>
        <ListItem button component={Link} to="/admin-dashboard/projects">
          <ListItemText primary="Projects" />
        </ListItem>
        <ListItem button component={Link} to="/admin-dashboard/recruitment">
          <ListItemText primary="Recruitment" />
        </ListItem>
        <ListItem button component={Link} to="/admin-dashboard/reports">
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
