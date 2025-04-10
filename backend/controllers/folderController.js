import Project from '../models/projectModel.js';
import Folder from '../models/folderModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const createFolder = catchAsync(async (req, res, next) => {
  const parentProjectId = req.params.projectId;
  const { name } = req.body;
  const parentProject = await Project.findById(parentProjectId);
  if (!parentProject) {
    return next(new AppError('No project found with that ID', 404));
  }
  const folder = {
    name,
    projectId: parentProjectId,
  }

  const newFolder = await Folder.create(folder);

  if (!newFolder) {
    return next(new AppError('Error creating folder', 400));
  }

  parentProject.folders.push(newFolder._id);
  await parentProject.save();

  res.status(200).json({
    status: 'success',
    data: {
      parentProject,
    },
  });
});