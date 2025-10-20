import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // Event Timeline
    dates: {
      registrationStarts: { type: Date, required: true },
      registrationEnds: { type: Date, required: true },
      eventStart: { type: Date, required: true },
      eventEnd: { type: Date, required: true },
    },

    location: { type: String, required: true, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],

    // Participation Rules
    participantRules: {
      minTeamSize: { type: Number, default: 1 },
      maxTeamSize: { type: Number, default: 1 },
      maxParticipants: { type: Number, default: 500 },
      registrationFee: { type: Number, default: 0 },
      eligibilityCriteria: { type: String, default: 'Open to all' },
    },

    eventLogistics: {
      eventMode: {
        type: String,
        enum: ["online", "offline", "hybrid"],
        default: 'Offline',
      },
      venueDetails: { type: String },
      contactInformation: { type: String, required: true },
      resourcesAndRequirements: { type: String },
    },

    prizesAndRewards: {
      prizes: { type: String },
      certificates: { type: Boolean, default: false },
      otherRewards: { type: String },
    },

    sponsorsAndPartners: [
      {
        name: { type: String, trim: true },
        logoUrl: { type: String, trim: true },
        website: { type: String, trim: true },
      },
    ],

    payment: {
      paymentGateway: {
        type: String,
        enum: ['Stripe', 'PayPal', 'Razorpay'],
      },
      // accountDetails: { type: String },
      transactionStatus: { type: String },
    },

    // Registered Teams
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
  },
  { timestamps: true }
);

//
// 🔥 Virtuals for Computed Fields
//

// Current number of registered teams
eventSchema.virtual('participantsCount').get(function () {
  return this.participants ? this.participants.length : 0;
});

// Check if registration is currently open
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    now >= this.dates.registrationStarts && now <= this.dates.registrationEnds
  );
});

// Check if event is ongoing
eventSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return now >= this.dates.eventStart && now <= this.dates.eventEnd;
});

// Check if event is finished
eventSchema.virtual('isFinished').get(function () {
  const now = new Date();
  return now > this.dates.eventEnd;
});

// Check if maximum participants reached
eventSchema.virtual('isFull').get(function () {
  return (
    this.participantsCount >= this.participantRules.maxParticipants
  );
});

// Ensure virtuals are serialized in JSON & Object
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
