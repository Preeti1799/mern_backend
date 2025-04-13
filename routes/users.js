import express from 'express';
import { verifyToken, verifyUser, verifyAdmin } from "../utils/verifyToken.js";
import { updateUser, deleteUser, getUser, getUsers } from "../controllers/user.js";

const router = express.Router();

// Use verifyToken for all routes in this file
router.use(verifyToken); // This will ensure the token is checked for all routes

router.put("/:id", verifyUser, updateUser);
router.delete("/:id", verifyUser, deleteUser);
router.get("/:id", verifyUser, getUser);
router.get("/", verifyAdmin, getUsers);

export default router;