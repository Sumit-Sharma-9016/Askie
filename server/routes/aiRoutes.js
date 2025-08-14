import { Router } from 'express';
import multer from 'multer';
import { explain, makeQuiz, grade, notes } from '../controllers/aiController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // up to 16MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF allowed'));
    cb(null, true);
  },
});

const router = Router();
router.post('/explain', upload.single('pdf'), explain);
router.post('/quiz', makeQuiz);
router.post('/grade', grade);
router.post('/notes', notes);

export default router;
