import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  rfc: { type: String, required: true },
  phone: String,
  company: String,
  status: { type: String, enum: ['lead', 'contacto', 'cliente'], default: 'lead' },
  notes: String,
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
