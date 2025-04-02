import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await Project.find();

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
    },
  });
});

export const createProject = catchAsync(async (req, res, next) => {
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
  await user.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});