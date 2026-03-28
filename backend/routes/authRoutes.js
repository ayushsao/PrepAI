import express from 'express';
import { registerUser, loginUser, getMe, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/me').get(protect, getMe).put(protect, updateMe);

export default router;
