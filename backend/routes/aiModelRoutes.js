// routes/aiModelRoutes.js
import express from 'express';
import {
  createAIModel,
  getAllAIModels,
  getAIModelById,
  updateAIModel,
  deleteAIModel,
  seedAIModels,
} from '../controllers/aiModelController.js';

const router = express.Router();

router.post('/seed', seedAIModels);
router.get('/', getAllAIModels);
router.get('/:id', getAIModelById);
router.post('/add', createAIModel);
router.put('/update/:id', updateAIModel);
router.delete('/delete/:id', deleteAIModel);

export default router;
