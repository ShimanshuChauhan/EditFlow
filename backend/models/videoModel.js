import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const videoSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Video = model('Video', videoSchema);
export default Video;