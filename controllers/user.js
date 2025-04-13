import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Update User
export const updateUser = async (req, res, next) => {
  try {
    const updatedData = req.body;

    // If the user is updating their password, hash the new password
    if (updatedData.password) {
      const salt = bcrypt.genSaltSync(10);
      updatedData.password = bcrypt.hashSync(updatedData.password, salt);
    }

    // Update the user with the new data
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updatedData }, // Only update fields passed in the request
      { new: true } // Return the updated user document
    );

    res.status(200).json({
      message: "User profile updated successfully.",
      user: updatedUser, // Return the updated user data
    });
  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
};

// Delete User
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};

// Get Single User
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Get All Users (Admin Only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
