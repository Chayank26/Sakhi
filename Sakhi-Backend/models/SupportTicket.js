import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    subject: { type: String, required: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ['Received', 'In Progress', 'Resolved'], default: 'Received' },
}, { timestamps: true });
export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', schema);
