import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const folderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  parentFolderId: {
    type: Schema.Types.ObjectId,
    ref: 'Folder'
  },
  folders: [{
    type: Schema.Types.ObjectId,
    ref: 'Folder',
    default: []
  }],
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'Video',
    default: []
  }]
}, { timestamps: true });

const Folder = model('Folder', folderSchema);
export default Folder;