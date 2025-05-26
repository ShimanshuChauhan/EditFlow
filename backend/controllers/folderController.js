import Project from '../models/projectModel.js';
import Folder from '../models/folderModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const deleteSubFolders = catchAsync(async (folderId) => {
  const subFolders = await Folder.findByIdAndDelete(folderId);
  if (!subFolders) return;

  for (const subFolderId of subFolders.folders) {
    await deleteSubFolders(subFolderId);
  }
});

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

export const getFolder = catchAsync(async (req, res, next) => {
  const folder = await Folder.findById(req.params.folderId);

  if (!folder) {
    return next(new AppError('No folder found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      folder,
    },
  });
});

export const createSubFolder = catchAsync(async (req, res, next) => {
  const parentFolderId = req.params.folderId;
  const { name } = req.body;

  const parentFolder = await Folder.findById(parentFolderId);

  if (!parentFolder) {
    return next(new AppError('No folder found with that ID', 404));
  }

  const subFolder = {
    name,
    projectId: parentFolder.projectId,
    parentFolderId,
  }

  const newSubFolder = await Folder.create(subFolder);

  if (!newSubFolder) {
    return next(new AppError('Error creating subfolder', 400));
  }

  parentFolder.folders.push(newSubFolder._id);
  await parentFolder.save();

  res.status(200).json({
    status: 'success',
    data: {
      parentFolder,
    },
  })
});

export const deleteFolder = catchAsync(async (req, res, next) => {
  const folderId = req.params.folderId;
  const folder = await Folder.findById(folderId);

  if (!folder) {
    return next(new AppError('No folder found with that ID', 404));
  }

  if (!folder.parentFolderId) {
    const project = await Project.findById(folder.projectId);
    project.folders = project.folders.filter((folder) => folder.toString() !== folderId.toString());
    await project.save();
  } else {
    const parentFolder = await Folder.findById(folder.parentFolderId);
    parentFolder.folders = parentFolder.folders.filter((folder) => folder.toString() !== folderId.toString());
    await parentFolder.save();
  }

  await deleteSubFolders(folderId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const updateFolder = catchAsync(async (req, res, next) => {
  const folder = await Folder.findByIdAndUpdate(req.params.folderId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!folder) {
    return next(new AppError('No folder found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      folder,
    },
  });
});