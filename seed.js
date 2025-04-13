import mongoose from "mongoose";
import Hotel from "./models/Hotel.js"; // Adjust path if needed
import dotenv from "dotenv";

dotenv.config();

const hotels = [
  {
    name: "Grand Hotel",
    city: "New York",
    address: "123 Broadway",
    distance: "5km",
    photos: ["photo1.jpg"],
    title: "Luxury Stay",
    desc: "A luxurious hotel in the heart of the city.", // Changed from description to desc
    type: "hotel", // Added type field
    rating: 4.5,
    cheapestPrice: 150,
  },
  {
    name: "Beach Resort",
    city: "Miami",
    address: "456 Ocean Dr",
    distance: "2km",
    photos: ["photo2.jpg"],
    title: "Beachfront Paradise",
    desc: "Relax by the beach.", // Changed from description to desc
    type: "resort", // Added type field
    rating: 4.7,
    cheapestPrice: 200,
  },
];

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB connected for seeding");
    return Hotel.insertMany(hotels);
  })
  .then(() => {
    console.log("Data seeded successfully");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    mongoose.connection.close();
  });