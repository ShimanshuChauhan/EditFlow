import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  sharedProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }],
  personalProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }],
  profilePic: {
    type: String,
    default: '/images/profilePic.jpg',
  },
  googleId: {
    type: String,
    unique: true,
  },
  oauthTokens: {
    type: Map,
    of: String,
  },
}, { timestamps: true });

const User = model('User', userSchema);
export default User;