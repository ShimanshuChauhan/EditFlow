import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    // Parent project of the video
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    // Folder in which the video is (null if it's root level)
    folderId: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    // User who uploaded the video
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Video = model('Video', videoSchema);
export default Video;