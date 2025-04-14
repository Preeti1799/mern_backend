import mongoose from "mongoose";
import Hotel from "./models/Hotel.js";
import "dotenv/config";

mongoose.connect(process.env.MONGO)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch(err => console.error("MongoDB connection error:", err));

const sampleHotels = [
  {
    name: "Grand Hotel",
    city: "New York",
    address: "123 Broadway",
    distance: "5 km",
    photos: ["photo1.jpg", "photo2.jpg"],
    title: "Luxury Stay",
    desc: "A luxurious hotel in the heart of the city.", // Added
    type: "hotel", // Added
    rating: 4.5,
    rooms: [],
    cheapestPrice: 150,
    featured: true,
  },
  {
    name: "Beach Resort",
    city: "Miami",
    address: "456 Ocean Drive",
    distance: "2 km",
    photos: ["photo3.jpg", "photo4.jpg"],
    title: "Beachfront Retreat",
    desc: "Relax by the ocean.", // Added
    type: "resort", // Added
    rating: 4.2,
    rooms: [],
    cheapestPrice: 200,
    featured: false,
  },
];

const seedDB = async () => {
  try {
    await Hotel.deleteMany(); // Optional: Clear existing data
    console.log("Cleared existing hotels");
    await Hotel.insertMany(sampleHotels);
    console.log("Database seeded with", sampleHotels.length, "hotels");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();