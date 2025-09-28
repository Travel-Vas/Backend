import { Router } from 'express';
import {
  signupController,
  verifyAccountController,
  loginController,
  updateProfileController,
  getProfileController,
  updatePasswordController,
  resetPasswordController,
  forgotPasswordController,
  resendOTPController,
  logoutController,
  refreshTokenController,
  updateAdminProfileController,
  actual_resetPasswordController,
  unboardingController,
  changePasswordController, totalUsersController
} from './user.controller';
import {
  createUserSchema,
  updateProfileSchema,
  resendOTPSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  verifyAccountSchema,
  resetPasswordsSchema, onboardingSchema,
} from './user.validation';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { authenticate, restrictTo } from '../../middlewares';
import { UserRole } from '../../helpers/constants';
import multer from 'multer'
import path from 'path';
import { CustomError } from '../../helpers/lib/App';
import * as fs from "node:fs";

const router = Router()
const uploadDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }
// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can customize the destination based on request if needed
    const dest = path.join(uploadDir, 'temp');
// console.log('destination beign called', dest);
    // // Create the directory if it doesn't exist
    // if (!fs.existsSync(dest)) {
    //   fs.mkdirSync(dest, { recursive: true });
    // }

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    console.log('filename beign called', `${uniqueSuffix}.${ext}`);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
  // console.log('filefilter beign called', `${ext}.${allowedExtensions}`);
  // Check file extension
  if (allowedExtensions.indexOf(ext) === -1) {
    return cb(new CustomError({ message: 'Only images are allowed!', code: 400 }));
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return cb(new CustomError({ message: 'File is too large! Maximum size is 10MB', code: 400 }));
  }

  cb(null, true);
};
export const upload = multer({ storage: storage, fileFilter:fileFilter })
export const cleanupTempFiles = (filePaths: string[]) => {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error);
    }
  });
};
export const thumbNailUpload = upload.single('thumb_nail');
export const profileUpload = upload.single('profile')



router.post('/register', validationMiddleware(createUserSchema), signupController)
router.post('/verify-account', validationMiddleware(verifyAccountSchema), verifyAccountController)
router.post('/resend-otp', validationMiddleware(resendOTPSchema), resendOTPController)
router.post('/forgot-password', validationMiddleware(forgotPasswordSchema), forgotPasswordController)
router.post('/verify-otp', validationMiddleware(resetPasswordSchema), resetPasswordController)
router.post('/reset-password', validationMiddleware(resetPasswordsSchema), actual_resetPasswordController)
router.post('/login', loginController)
router.get('/logout', authenticate, logoutController)
router.patch('/update-password', authenticate, validationMiddleware(updatePasswordSchema), updatePasswordController)
router.get('/refresh-token', refreshTokenController)
router.post('/unboarding', authenticate, validationMiddleware(onboardingSchema), unboardingController)
router.post("/change-password", authenticate, changePasswordController)
router.route('/')
  .patch(authenticate, validationMiddleware(updateProfileSchema), profileUpload, updateProfileController)
  .get(authenticate, getProfileController)
router.get("/total", authenticate, totalUsersController)
  router.patch("/:id", authenticate, updateAdminProfileController )

export default { router, path: '/user' }
