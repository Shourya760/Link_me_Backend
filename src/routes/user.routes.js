import express from "express";
import { create_user, login_user, logout_user, deactivate_user, upload_image } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authmiddleware.js";
import { uploadSingleImage } from "../middleware/imageUpload.js";


const router = express.Router();


router.post("/auth/register", create_user);
router.post("/auth/login", login_user);
router.post("/auth/logout", logout_user);
router.delete("/auth/account", authenticate, deactivate_user);
router.post("/uploads/image", authenticate, uploadSingleImage, upload_image);

export default router;
