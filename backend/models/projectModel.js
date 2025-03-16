import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }, role: {
      type: String,
      enum: ['ownwer', 'editor', 'viewer'],
      required: true
    },
  }],
  folders: [{
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    default: [],
  }],
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video',
    default: [],
  }],
}, { timestamps: true });

const Project = model('Project', projectSchema);
export default Project;