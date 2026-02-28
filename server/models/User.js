import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  deviceFingerprint: {
    type: String,
    required: true,
    unique: true
  },
  whatsapp: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^(\+62|62|0)[8-9][0-9]{8,14}$/, 'Please enter a valid phone number']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    platform: String,
    screenResolution: String,
    timezone: String,
    language: String
  },
  ratingsGiven: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
