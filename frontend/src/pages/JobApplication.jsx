import React, { useState } from 'react';
import axios from 'axios';

const JobApplication = () => {
  const [position, setPosition] = useState('');
  const [experience, setExperience] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/recruitment',
        { position, experience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Application submitted!');
      setPosition('');
      setExperience('');
    } catch (error) {
      console.error('Error submitting application', error);
      alert('Failed to apply');
    }
  };

  return (
    <div>
      <h2>Apply for a Job</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Job Position" value={position} onChange={(e) => setPosition(e.target.value)} required />
        <input type="number" placeholder="Years of Experience" value={experience} onChange={(e) => setExperience(e.target.value)} required />
        <button type="submit">Apply</button>
      </form>
    </div>
  );
};

export default JobApplication;
