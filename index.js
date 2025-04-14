import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import hotelRoute from "./routes/hotels.js";
import userRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import roomRoute from "./routes/rooms.js";

dotenv.config();

const app = express();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL); // ✅ updated from MONGO to MONGO_URL
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

app.use(
  cors({
    origin: [
      "https://client-chi-flax.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/hotels", hotelRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(8800, () => {
  connect();
  console.log("Server running on port 8800");
});
