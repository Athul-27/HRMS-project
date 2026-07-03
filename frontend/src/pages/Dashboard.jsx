import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import PaidIcon from '@mui/icons-material/Paid';

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
            <PeopleIcon fontSize="large" />
            <Typography variant="h6">Total Employees</Typography>
            <Typography variant="h5">120</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
            <WorkIcon fontSize="large" />
            <Typography variant="h6">Active Projects</Typography>
            <Typography variant="h5">25</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
