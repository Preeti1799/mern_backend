// C:\Users\paswa\Mern stack\Mern-stack-hotel-booking-App\api\routes\resetPassword.js
import express from "express";
import { forgotPassword, resetPassword } from "../controllers/auth.js";
import { verifyToken } from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/", verifyToken, resetPassword);

export default router;