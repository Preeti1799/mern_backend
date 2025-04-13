import Booking from '../models/Booking.js'; // Ensure you have the correct path to the Booking model
import Room from '../models/Room.js'; // Ensure you have the correct path to the Room model

// Book a room
export const bookRoom = async (req, res) => {
    const { roomId, bookingDates } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if the room is available
        const isAvailable = room.roomNumbers.some((roomNumber) => {
            return !roomNumber.unavailableDates.some((date) => bookingDates.includes(date));
        });

        if (!isAvailable) {
            return res.status(400).json({ message: 'No room available for selected dates' });
        }

        // Continue with the booking process if available
        const newBooking = new Booking({
            roomId,
            userId: req.user.id, // Assuming user ID is available from token
            bookingDates,
        });

        await newBooking.save(); // Save the booking in the database

        // Update room's unavailable dates
        room.roomNumbers.forEach(roomNumber => {
            if (bookingDates.every(date => !roomNumber.unavailableDates.includes(date))) {
                roomNumber.unavailableDates.push(...bookingDates);
            }
        });
        await room.save(); // Save the room with updated unavailable dates

        res.status(200).json({ message: 'Room booked successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
