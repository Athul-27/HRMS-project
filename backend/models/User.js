const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the user schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Admin", "HR", "Employee", "Recruiter"],
    required: true,
  },
});

// Pre-save hook to hash the password before saving the user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // If password is not modified, skip hashing

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    next(err); // If an error occurs during hashing, pass it to the next middleware
  }
});

// Method to compare the entered password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Compare the password with the hashed one
};

// Static method to update the user password if provided (or leave it unchanged)
UserSchema.statics.updatePassword = async function (userId, newPassword) {
  const user = await this.findById(userId);
  if (!user) throw new Error("User not found");

  if (newPassword) {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    user.password = await bcrypt.hash(newPassword, salt); // Hash the new password
  }

  return user.save();
};

module.exports = mongoose.model("User", UserSchema);
