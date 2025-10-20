import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utiles/db.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import eventRouter from './routers/eventRouter.js'; 
import userRouter from './routers/userRouter.js';
import teamRouter from './routers/teamRouter.js';
import joinRequestRouter from './routers/joinRequestRouter.js';
import messageRouter from './routers/messageRouter.js';
dotenv.config();

const app = express();

connectDB();

app.use(cors(
  {
    origin: 'http://localhost:5001', // Adjust this to your frontend UR
    credentials: true,
  }
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

// Static serving for uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRouter);
app.use('/api/teams', teamRouter);
app.use('/api/events', eventRouter);
app.use('/api/join-requests', joinRequestRouter);
app.use('/api/messages', messageRouter);
app.get('/', (req, res) => {
  res.send('Welcome to TeamHub Backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});