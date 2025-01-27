import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const folderSchema = new Schema({
    folderName: {
        type: String,
        required: true
    },
    // Parent project of the folder
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    // Parent folder of the folder (null if it is a root folder)
    parentFolderId: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    // Contents of the folder
    contents: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder' || 'Video'
    }]
}, { timestamps: true });

const Folder = model('Folder', folderSchema);
export default Folder;