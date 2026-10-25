import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { get_my_profile, get_public_profile, update_my_profile } from "../controllers/profile.controller.js";



const router = express.Router();
router.get("/profiles/me", authenticate, get_my_profile);
router.patch("/profiles/me", authenticate, update_my_profile);
router.get("/profiles/:username", get_public_profile);

export default router;
