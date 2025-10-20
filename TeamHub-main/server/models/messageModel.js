// Message model for team chat (added)
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileType: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);


