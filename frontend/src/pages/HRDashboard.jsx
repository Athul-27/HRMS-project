import React from 'react';
import Sidebar from '../components/Sidebar';

const HRDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <h2>HR Dashboard</h2>
        <p>Manage employees, approve leaves, process payroll, and handle recruitment.</p>
      </div>
    </div>
  );
};

export default HRDashboard;
