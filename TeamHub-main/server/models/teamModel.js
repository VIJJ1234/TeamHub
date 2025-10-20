import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    aim: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    maxMembers: { type: Number, required: true, min: 2 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    skills: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Virtual for current member count
TeamSchema.virtual('membersCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual to check if team is full
TeamSchema.virtual('isFull').get(function() {
  return this.membersCount >= this.maxMembers;
});

// Ensure virtuals are serialized
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });

export default mongoose.model('Team', TeamSchema);


