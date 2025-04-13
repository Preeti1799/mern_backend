import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import axios from "axios";

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
  let inrRate = 83; // fallback
  try {
    const apiUrl = date
      ? `https://api.exchangerate.host/${date}?base=USD&symbols=INR`
      : `https://api.exchangerate.host/latest?base=USD&symbols=INR`;
    console.log("Fetching INR rate from:", apiUrl); // Debug log
    const response = await axios.get(apiUrl, {
      headers: { "Accept-Encoding": "identity" }, // Avoid compression issues
    });
    inrRate = response.data.rates?.INR || 83;
    console.log("INR rate fetched:", inrRate);
    res.status(200).json({ inrRate });
  } catch (error) {
    console.error("Error fetching INR rate:", error.message, error.stack); // Full error
    res.status(500).json({ error: "Failed to fetch INR rate", details: error.message });
  }
};