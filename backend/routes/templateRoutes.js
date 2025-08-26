import express from 'express';
import * as templateController from '../controllers/templateController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const mainDir = path.join(__dirname, '..', '..');
        if (file.fieldname === 'thumbnails') {
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

// Routes for CRUD operations
router.post(
    '/',
    upload.fields([
        { name: 'thumbnails', maxCount: 5 }, // Allows up to 5 images
        { name: 'templateZip', maxCount: 1 }
    ]),
    templateController.createTemplate
);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

router.put('/:id', upload.fields([
    { name: 'thumbnails', maxCount: 5 },
    { name: 'templateZip', maxCount: 1 }
]), templateController.updateTemplate);

router.delete('/:id', templateController.deleteTemplate);
router.get('/download/:id', templateController.downloadTemplate);

export default router;