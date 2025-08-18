// routes/templateRoutes.js
import express from 'express';
import * as templateController from '../controllers/templateController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize the router object
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Corrected: The destination path now navigates up to the main directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Navigate two levels up from the 'routes' folder
    const mainDir = path.join(__dirname, '..', '..');
    if (file.fieldname === 'thumbnail') {
      cb(null, path.join(mainDir, 'thumbnails'));
    } else if (file.fieldname === 'templateZip') {
      cb(null, path.join(mainDir, 'templates'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'templateZip', maxCount: 1 }
  ]),
  templateController.createTemplate
);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'templateZip', maxCount: 1 }
]), templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.get('/download/:id', templateController.downloadTemplate);

export default router;