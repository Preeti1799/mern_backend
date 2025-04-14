import express from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getHotel,
  getHotels,
  updateHotel,
  getInrRate,
} from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Specific routes before wildcards
router.post("/", verifyAdmin, createHotel);
router.put("/:id", verifyAdmin, updateHotel);
router.delete("/:id", verifyAdmin, deleteHotel);
router.get("/", getHotels); // Add this line to handle /api/hotels
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/featured", getHotels); // Remove extra /api
router.get("/inrRate", getInrRate); // Specific route
router.get("/:id", getHotel); // Wildcard route last

export default router;