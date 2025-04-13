import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    bookingDates: {
      type: [Date],
      required: true,
    },
    // You can add more fields here if needed (e.g., payment info, customer details)
  },
  { timestamps: true }
);

export default mongoose.model('Booking', BookingSchema);
