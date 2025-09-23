import asyncHandler from 'express-async-handler';
import Project from '../models/projectSchema.js';
import TrafficLog from '../models/TrafficLog.js';
import mongoose from 'mongoose';

// Get all projects (for dropdown in modal)
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}, 'projectName projectDescription');
  res.json(projects);
});

// Get recent traffic for a specific project
export const getTrafficLogs = asyncHandler(async (req, res) => {
  const { projectId, limit = 20, filter = 'All' } = req.query;
  if (!projectId) {
    res.status(400);
    throw new Error('projectId is required');
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new Error('Invalid projectId');
  }
  let query = { projectId: new mongoose.Types.ObjectId(projectId) };
  if (filter !== 'All') {
    query.status = filter;
  }

  const logs = await TrafficLog.find(query)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .populate('projectId', 'projectName');

  res.json(logs);
});

// Generate and save simulated traffic for a project
export const generateTraffic = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    res.status(400);
    throw new Error('projectId is required');
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new Error('Invalid projectId');
  }

  // Simulate random traffic entry
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const paths = ['/api/login', '/dashboard', '/wp-admin', '/api/data', '/uploads'];
  const statuses = ['ALLOW', 'BLOCK'];
  const countries = ['US', 'UK', 'DE', 'FR', 'JP', 'CN', 'RU'];

  const traffic = new TrafficLog({
    projectId: new mongoose.Types.ObjectId(projectId),
    method: methods[Math.floor(Math.random() * methods.length)],
    path: paths[Math.floor(Math.random() * paths.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    statusCode: Math.random() > 0.8 ? 403 : 200,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: countries[Math.floor(Math.random() * countries.length)],
    timestamp: new Date(),
  });

  await traffic.save();
  // console.log(`Generated traffic for project ${projectId}:`, traffic); // Debug log
  res.status(201).json(traffic);
});