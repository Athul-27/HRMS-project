import React, { useState } from 'react';
import axios from 'axios';

const ApplyLeave = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Sick Leave');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/leave/apply',
        { startDate, endDate, reason, leaveType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Leave request submitted!');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      console.error('Error submitting leave request', error);
      alert('Failed to submit leave request');
    }
  };

  return (
    <div>
      <h2>Request Leave</h2>
      <form onSubmit={handleSubmit}>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Annual Leave">Annual Leave</option>
          <option value="Maternity Leave">Maternity Leave</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <input type="text" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button type="submit">Request Leave</button>
      </form>
    </div>
  );
};

export default ApplyLeave;
