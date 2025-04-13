import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import axios from "axios";
require('dotenv').config();

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);
  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted");
  } catch (err) {
    next(err);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

export const getHotels = async (req, res, next) => {
  const { min, max, featured, limit, nights, ...others } = req.query;
  try {
    const query = {
      ...others,
      cheapestPrice: { $gt: parseInt(min) || 1, $lt: parseInt(max) || 999 },
    };
    if (featured) {
      query.featured = featured === "true"; // Convert string to boolean
    }
    const hotels = await Hotel.find(query).limit(parseInt(limit) || 10);
    console.log("getHotels query:", query, "result:", hotels);
    // Calculate totalPrice if nights is provided
    let updatedHotels = hotels;
    if (nights) {
      updatedHotels = hotels.map(hotel => ({
        ...hotel._doc,
        totalPrice: hotel.cheapestPrice * parseInt(nights),
      }));
    }
    console.log("getHotels result with pricing:", updatedHotels);
    res.status(200).json(updatedHotels);
  } catch (err) {
    next(err);
  }
};

export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => Hotel.countDocuments({ city }))
    );
    const result = cities.map((city, index) => ({ city, count: list[index] }));
    console.log("countByCity result:", result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });
    const result = [
      { type: "hotel", count: hotelCount },
      { type: "apartment", count: apartmentCount },
      { type: "resort", count: resortCount },
      { type: "villa", count: villaCount },
      { type: "cabin", count: cabinCount },
    ];
    console.log("countByType result:", result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => Room.findById(room))
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const getInrRate = async (req, res) => {
  const { date } = req.query;
  let inrRate = 83; // Default fallback value

  try {
    // Validate date format and default to latest if invalid or unsupported
    const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
    const apiUrl = isValidDate
      ? `https://api.exchangerate.host/${date}?base=USD&symbols=INR`
      : `https://api.exchangerate.host/latest?base=USD&symbols=INR`;

    console.log("Fetching INR rate from:", apiUrl); // Debug log
    const response = await axios.get(apiUrl, {
      headers: { "Accept-Encoding": "identity" }, // Avoid compression issues
      timeout: 5000, // Prevent hanging
    });

    // Safely extract INR rate
    inrRate = response.data.rates?.INR;
    if (inrRate === undefined) {
      throw new Error('INR rate not found in API response');
    }
    console.log("INR rate fetched:", inrRate);
  } catch (error) {
    console.error("Error fetching INR rate:", {
      message: error.message,
      code: error.code,
      stack: error.stack, // Full stack trace
      response: error.response?.data || 'No response data',
    });
    // Log warning and use fallback
    console.warn("Falling back to default INR rate:", inrRate);
  }

  res.status(200).json({ inrRate }); // Always return 200 with fallback
};