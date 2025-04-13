import express from "express";
import { 
  createRoom,
  deleteRoom, 
  getRoom,
  getRooms, 
  updateRoom,
  updateRoomAvailability,
} from "../controllers/room.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// Route to create a new room (admin only)
router.post("/:hotelid", verifyAdmin, createRoom);

// Route to update a room (admin only)
router.put("/:id", verifyAdmin, updateRoom);

// Route to update room availability (no admin verification)
router.put("/availability/:id", updateRoomAvailability); // Added missing forward slash

// Route to delete a room (admin only)
router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);

// Route to get a single room by ID
router.get("/:id", getRoom);

// Route to get all rooms
router.get("/", getRooms);

export default router;