import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    // Projects shared with user
    sharedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    // Projects created by user
    personalProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    profilePicture: {
        type: String
    },
    // Unique identifier for the user even if they log in from different platforms
    googleId: {
        type: String,
        unique: true,
    },
    oauthTokens: {
        type: Map,
        of: String
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;