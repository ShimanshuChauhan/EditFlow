import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const projectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissions: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer'],
            required: true
        }
    }],
    contents: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder' || 'Video'
    }]
}, { timestamps: true });

const Project = model('Project', projectSchema);
export default Project;