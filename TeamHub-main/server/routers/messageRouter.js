// Routes for team chat messages with file upload (added)
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuthenticationMiddleware } from '../middlewares/authHandlerMiddleware.js';
import { listTeamMessages, createMessage } from '../controllers/messageController.js';

const router = express.Router();

// Multer setup for chat uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `chat-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

router.use(AuthenticationMiddleware);

router.get('/:teamId', listTeamMessages);
router.post('/:teamId', upload.single('file'), createMessage);

export default router;


