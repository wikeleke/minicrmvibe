import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'manager', 'agent', 'viewer'], default: 'viewer' },
  privileges: { type: [String], default: [] },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
