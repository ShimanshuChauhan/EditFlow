import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from 'cloudinary';
import videoModel from '../models/videoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Project from '../models/projectModel.js';
import Folder from '../models/folderModel.js';
import { stat, Stats } from 'fs';
import { profileEnd } from 'console';
import Video from '../models/videoModel.js';

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
          folder: `${parentProject._id}`,
          public_id: `${Date.now()}-${videoName || videoFile.originalname}`,
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

export const uploadVideoInFolder = [upload.single('video'), catchAsync(async (req, res, next) => {
  const { folderId } = req.params;
  const { videoName } = req.body;
  const videoFile = req.file;

  const folder = await Folder.findById(folderId);

  if (!folder) {
    return next(new AppError('No Folder found with that ID', 404));
  }

  if (!videoFile) {
    return next(new AppError('No video file found', 400));
  }

  const bufferStream = Readable.from(videoFile.buffer);

  // Upload to Cloudinary using upload_stream
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: `${folder.projectId}`,
        public_id: `${Date.now()}-${videoName || videoFile.originalname}`,
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
    projectId: folder.projectId,
    folderId: folder._id,
    uploadedBy: req.user._id,
  });

  if (!video) {
    return next(new AppError('Error uploading the video'));
  }

  folder.videos.push(video._id);
  await folder.save();

  res.status(201).json({
    status: 'success',
    data: {
      video
    }
  })
})];

export const deleteVideo = catchAsync(async (req, res, next) => {
  const { projectId, videoId } = req.params;

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    return next(new AppError('No video found with that ID', 404));
  }

  const { publicId } = video;

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId, { resource_type: "video" });
    if (result.result !== 'ok')
      return next(new AppError('Failed to delete video from Cloudinary', 500));
  }
  catch (error) {
    return next(new AppError(`Cloudinary deletion failed: ${error.message}`, error.http_code || 500));
  }

  if (!video.folderId) {
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }
    project.videos = project.videos.filter((video) => video.toString() !== videoId.toString());
    await project.save();
  }
  else {
    const parentFolder = await Folder.findById(video.folderId);
    if (!parentFolder) {
      return new AppError('No folder found with that Id', 404);
    }
    const updatedFolder = parentFolder.folders((folder) => folder.toString() !== video.folderId);
    await updatedFolder.save();
  }

  res.json(201).status({
    status: 'success'
  })
});