import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recruitment = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token'); // Get JWT token
        const response = await axios.get('http://localhost:5000/api/recruitment', {
          headers: { Authorization: `Bearer ${token}` }, // Pass token for authentication
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching job applications', error);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div>
      <h2>Job Applications</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Applicant Name</th>
            <th>Position</th>
            <th>Experience</th>
            <th>Application Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td>{app.applicantName}</td>
              <td>{app.position}</td>
              <td>{app.experience} years</td>
              <td>{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recruitment;
