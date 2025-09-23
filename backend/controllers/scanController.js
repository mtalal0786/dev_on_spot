// controllers/scanController.js
import asyncHandler from 'express-async-handler';
import Scan from '../models/Scan.js';
import { v4 as uuidv4 } from 'uuid';

export const initiateScan = asyncHandler(async (req, res) => {
  const scanId = uuidv4();
  const scan = new Scan({ scanId });
  await scan.save();
  console.log(`Scan initiated with ID: ${scanId}`); // Debug log

  setTimeout(async () => {
    scan.status = 'in-progress';
    await scan.save();
    let progress = 0;
    const interval = setInterval(async () => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        scan.status = 'completed';
        scan.progress = 100;
        // Generate random stats
        scan.filesScanned = Math.floor(Math.random() * 2000) + 500; // Random between 500 and 2500
        scan.threatsFound = Math.floor(Math.random() * 10); // Random between 0 and 9
        scan.vulnerabilities = Math.floor(Math.random() * 5); // Random between 0 and 4
        scan.severity = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]; // Random severity
        scan.completedAt = new Date();
        await scan.save();
        console.log(`Scan ${scanId} completed with stats:`, {
          filesScanned: scan.filesScanned,
          threatsFound: scan.threatsFound,
          vulnerabilities: scan.vulnerabilities,
          severity: scan.severity,
        }); // Debug log
        clearInterval(interval);
      } else {
        scan.progress = Math.min(progress, 100);
        await scan.save();
        console.log(`Scan ${scanId} progress: ${scan.progress}%`); // Debug log
      }
    }, 500);
  }, 1000);

  res.status(201).json({ scanId, status: 'pending', progress: 0 });
});

export const getScanStatus = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ scanId: req.params.scanId });
  if (!scan) {
    res.status(404);
    throw new Error('Scan not found');
  }
  console.log(`Returning scan status for ${req.params.scanId}:`, scan); // Debug log
  res.json({
    scanId: scan.scanId,
    status: scan.status,
    progress: scan.progress,
    filesScanned: scan.filesScanned || 0,
    threatsFound: scan.threatsFound || 0,
    vulnerabilities: scan.vulnerabilities || 0,
    severity: scan.severity || 'Low',
    startedAt: scan.startedAt,
    completedAt: scan.completedAt,
  });
});