import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
