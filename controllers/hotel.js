import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import axios from "axios";
import "dotenv/config";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);
  try {
    const savedHotel = await newHotel.save();
    console.log("Created hotel:", savedHotel); // Debug log
    res.status(200).json(savedHotel);
  } catch (err) {
    console.error("Error creating hotel:", err);
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
    console.log("Updated hotel:", updatedHotel); // Debug log
    res.status(200).json(updatedHotel);
  } catch (err) {
    console.error("Error updating hotel:", err);
    next(err);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    console.log("Deleted hotel with ID:", req.params.id); // Debug log
    res.status(200).json("Hotel has been deleted");
  } catch (err) {
    console.error("Error deleting hotel:", err);
    next(err);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    console.log("Retrieved hotel:", hotel); // Debug log
    res.status(200).json(hotel);
  } catch (err) {
    console.error("Error getting hotel:", err);
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
      query.featured = featured === "true";
    }
    const hotels = await Hotel.find(query).limit(parseInt(limit) || 10);
    console.log("getHotels query:", query, "result:", hotels); // Debug log
    let updatedHotels = hotels;
    if (nights) {
      updatedHotels = hotels.map(hotel => ({
        ...hotel._doc,
        totalPrice: hotel.cheapestPrice * parseInt(nights),
      }));
    }
    console.log("getHotels result with pricing:", updatedHotels); // Debug log
    res.status(200).json(updatedHotels);
  } catch (err) {
    console.error("Error getting hotels:", err);
    next(err);
  }
};

export const countByCity = async (req, res, next) => {
  const cities = req.query.cities ? req.query.cities.split(",") : [];
  try {
    const list = await Promise.all(
      cities.map(city => {
        const trimmedCity = city.trim();
        console.log(`Counting documents for city: ${trimmedCity}`); // Debug log
        return Hotel.countDocuments({ city: trimmedCity }); // Exact match with trim
      })
    );
    const allHotels = await Hotel.find(); // Debug all data
    console.log("All hotels in collection:", allHotels); // Debug log
    const result = cities.map((city, index) => ({ city: city.trim(), count: list[index] }));
    console.log("countByCity result:", result); // Debug log
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in countByCity:", err);
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
    console.log("countByType result:", result); // Debug log
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in countByType:", err);
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => Room.findById(room))
    );
    console.log("Retrieved rooms for hotel:", list); // Debug log
    res.status(200).json(list);
  } catch (err) {
    console.error("Error getting hotel rooms:", err);
    next(err);
  }
};

export const getInrRate = async (req, res) => {
  const defaultRate = 83;
  let inrRate = defaultRate;

  try {
    const { date } = req.query;
    const isValidDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date);
    const apiUrl = isValidDate
      ? `https://api.exchangerate.host/${date}?base=USD&symbols=INR&access_key=${process.env.EXCHANGE_RATE_API_KEY}`
      : `https://api.exchangerate.host/latest?base=USD&symbols=INR&access_key=${process.env.EXCHANGE_RATE_API_KEY}`;

    console.log("Fetching INR rate from:", apiUrl);
    const response = await axios.get(apiUrl, {
      headers: { "Accept-Encoding": "identity" },
      timeout: 5000,
    });

    inrRate = response.data.rates?.INR;
    if (inrRate === undefined) {
      throw new Error("INR rate not found in API response");
    }
    console.log("INR rate fetched:", inrRate);
  } catch (error) {
    console.error("Error fetching INR rate:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      response: error.response?.data || "No response data",
    });
    console.warn("Falling back to default INR rate:", defaultRate);
    inrRate = defaultRate;
  }

  res.status(200).json({ inrRate });
};