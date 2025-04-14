import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  distance: {
    type: String,
    required: true
  },
  photos: {
    type: [String]
  },
  desc: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  rooms: {
    type: [String], // Consider [mongoose.Schema.Types.ObjectId] if using Room model
  },
  cheapestPrice: {
    type: Number,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

export default mongoose.model("Hotel", HotelSchema, "hotels"); // Explicitly set collection to "hotels"