import express from 'express';
import {
  getBlogPosts,
  createBlogPost,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  upload // Import the upload middleware
} from '../controllers/blogController.js';

const router = express.Router();

router.route('/').get(getBlogPosts).post(upload.fields([{ name: 'image', maxCount: 1 }]), createBlogPost); // `upload.fields` processes the image
router.route('/:id').get(getBlogPostById).put(upload.fields([{ name: 'image', maxCount: 1 }]), updateBlogPost).delete(deleteBlogPost); // `upload.fields` processes the image on update

export default router;
