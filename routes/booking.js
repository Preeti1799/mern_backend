import express from "express";
import { bookRoom } from "../controllers/booking.js"; 
import { verifyToken } from "../utils/verifyToken.js"; 

const router = express.Router();

router.post("/book", verifyToken, bookRoom); 

export default router;
