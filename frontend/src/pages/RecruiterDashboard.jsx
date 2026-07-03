import React from 'react';
import { Link } from 'react-router-dom';

const RecruiterDashboard = () => {
  return (
    <div>
      <h2>Recruiter Dashboard</h2>
      <ul>
        <li><Link to="/recruitment">Manage Job Applications</Link></li>
      </ul>
    </div>
  );
};

export default RecruiterDashboard;
