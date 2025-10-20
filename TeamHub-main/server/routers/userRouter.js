import express from 'express';
import { 
    userRegistration,
    userSignIn,
    getProfileOfUser,
    updateUserProfile,
    forgetPassword,
    uploadProfilePicture,
 } from '../controllers/userController.js';
import { AuthenticationMiddleware } from '../middlewares/authHandlerMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const userRouter = express.Router();

// Multer setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        // Save into server/uploads regardless of current working directory
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage });

userRouter.post('/register',userRegistration)
userRouter.post('/signin',userSignIn) //👈 your login route

userRouter.get('/signout', (req, res) => {
    res.clearCookie("user").json({ message: 'User signed out successfully' });
}); 
userRouter.patch('/update', AuthenticationMiddleware,updateUserProfile);
userRouter.patch('/forgetpassword', AuthenticationMiddleware,forgetPassword);
userRouter.post('/upload-avatar', AuthenticationMiddleware, upload.single('avatar'), uploadProfilePicture);

userRouter.get('/profile', AuthenticationMiddleware, getProfileOfUser)


export default userRouter;
