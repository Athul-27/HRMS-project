const bcrypt = require("bcryptjs");

const hash =  "$2b$10$.CQ5964vYUlnZrQwtqlK4epl49t.FLbcC/v7By46I3rpMiGDRx/cO";

// Replace with the password you entered while creating the employee
bcrypt.compare("John@123", hash).then(console.log);