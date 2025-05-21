import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from 'cloudinary';
import videoModel from '../models/videoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Project from '../models/projectModel.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new AppError('Not a video! Please upload only videos.', 400), false);
    }
    cb(null, true);
  },
});

export const uploadVideo = [
  upload.single('video'),
  catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { videoName } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return next(new AppError('No video file found', 400));
    }

    const parentProject = await Project.findById(projectId);
    if (!parentProject) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Convert buffer to readable stream
    const bufferStream = Readable.from(videoFile.buffer);

    // Upload to Cloudinary using upload_stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: `projects/${parentProject._id}/videos`,
          public_id: `${Date.now()}${videoName || videoFile.originalname}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      bufferStream.pipe(stream);
    });

    const video = await videoModel.create({
      name: videoName || videoFile.originalname,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      projectId: parentProject._id,
      uploadedBy: req.user._id,
    });

    parentProject.videos.push(video._id);
    await parentProject.save();

    res.status(201).json({
      status: 'success',
      data: {
        video,
      },
    });
  }),
];

export const getVideo = catchAsync(async (req, res, next) => {
  const video = await videoModel.findById(req.params.videoId);

  if (!video) {
    return next(new AppError('No video found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      video
    }
  })
});