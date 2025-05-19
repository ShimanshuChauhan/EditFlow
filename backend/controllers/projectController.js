import Project from '../models/projectModel.js';
import Folder from '../models/folderModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { deleteSubFolders } from './folderController.js';

export const getAllProjects = catchAsync(async (req, res) => {
  const projects = await Project.find();

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
    },
  });
});

export const createProject = catchAsync(async (req, res) => {
  const project = { ...req.body, ownerId: req.user._id };
  const newProject = await Project.create(project);

  const user = await User.findById(req.user._id);
  user.personalProjects.push(newProject._id);
  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      newProject
    },
  });
});

export const getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json(
    {
      status: 'success',
      data: {
        project
      }
    }
  );
});

export const updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndUpdate(req.params.projectId, req.body, {
    new: true,
    runValidators: true
  });

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

export const deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.projectId);
  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  const user = await User.findById(req.user._id);
  user.personalProjects = user.personalProjects.filter((projectId) => projectId.toString() !== req.params.projectId);
  const sharedUsers = project.permissions.map((permission) => {
    return permission.userId.toString();
  });

  const userPromise = sharedUsers.map((userId) => {
    return User.findById(userId);
  });

  const sharedUser = await Promise.all(userPromise);
  sharedUser.forEach((user) => {
    user.sharedProjects = user.sharedProjects.filter((projectId) => projectId.toString() !== req.params.projectId);
  });

  await Promise.all(sharedUser.map((user) => user.save()));
  await user.save();

  await Promise.all(project.folders.map(async (folderId) => {
    await deleteSubFolders(folderId);
  }));

  res.status(204).json({
    status: 'success',
    data: null
  });
});


export const updatePermissions = catchAsync(async (req, res, next) => {
  let project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  const { userId, role } = req.body;

  const sharedUser = await User.findById(userId);
  console.log(sharedUser);
  if (!sharedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  const existingPermission = project.permissions.find(
    (permission) => permission.userId.toString() === userId
  );

  if (existingPermission) {
    existingPermission.role = role;
  } else {
    project.permissions.push({ userId, role });
    sharedUser.sharedProjects.push(project._id);
  }

  await project.save();
  await sharedUser.save();

  return res.status(200).json({
    status: 'success',
    data: {
      message: 'Permissions updated successfully'
    }
  });
});