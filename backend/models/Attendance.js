const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    checkIn: { type: String, required: true }, // Example: "09:00 AM"
    checkOut: { type: String }, // Example: "06:00 PM"
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
