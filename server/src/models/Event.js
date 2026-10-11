import mongoose from 'mongoose';

const subEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: null
    },
    time: {
      type: String,
      default: '10:00 AM'
    },
    venue: {
      type: String,
      default: ''
    },
    guestCount: {
      type: Number,
      default: 100,
      min: 0
    }
  },
  { _id: true }
);

const budgetExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        'Decor & Mandap',
        'Catering & Food',
        'Baraat & Cars',
        'Photography & Video',
        'Outfits & Jewelry',
        'Music, DJ & Lights',
        'Mehendi & Makeup',
        'Venue & Lodging',
        'Gifts & Invitations',
        'Miscellaneous'
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

const eventTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General'
    },
    deadline: {
      type: Date,
      default: null
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    }
  },
  { _id: true }
);

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    side: {
      type: String,
      enum: ['BRIDE', 'GROOM', 'MUTUAL'],
      default: 'MUTUAL'
    },
    rsvpStatus: {
      type: String,
      enum: ['ATTENDING', 'DECLINED', 'PENDING'],
      default: 'PENDING'
    },
    attendingCount: {
      type: Number,
      default: 1,
      min: 1
    },
    dietaryPreference: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'JAIN'],
      default: 'VEG'
    }
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    weddingTitle: {
      type: String,
      required: true,
      default: "Our Dream Wedding Celebration",
      trim: true
    },
    brideName: {
      type: String,
      default: 'Bride',
      trim: true
    },
    groomName: {
      type: String,
      default: 'Groom',
      trim: true
    },
    primaryDate: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days ahead
    },
    totalBudget: {
      type: Number,
      default: 1500000, // 15 Lakhs INR typical benchmark
      min: 0
    },
    city: {
      type: String,
      default: 'Delhi NCR'
    },
    subEvents: [subEventSchema],
    budgetExpenses: [budgetExpenseSchema],
    tasks: [eventTaskSchema],
    guests: [guestSchema]
  },
  {
    timestamps: true
  }
);

export const Event = mongoose.model('Event', eventSchema);
