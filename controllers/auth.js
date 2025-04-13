import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email (from .env)
        pass: process.env.EMAIL_PASS, // Your email app password (from .env)
    },
});

// User Registration
export const register = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({
            ...req.body,
            password: hash,
        });

        await newUser.save();
        res.status(201).json({ message: "User has been created successfully" });
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// User Login
export const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            console.warn(`User not found: ${req.body.username}`);
            return res.status(404).json({ message: "User not found!" });
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            console.warn(`Invalid credentials for user: ${req.body.username}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is missing from environment variables.");
            return res.status(500).json({ message: "Internal Server Error" });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            jwtSecret,
            { expiresIn: "1h" }
        );

        const { password, ...otherDetails } = user._doc;

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        res.status(200).json({ details: otherDetails, isAdmin: user.isAdmin });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Forgot Password - Send reset link
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`Email not found: ${email}`);
            return res.status(404).json({ message: "Email not found. Please try again." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();

        const resetLink = `http://localhost:3001/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "A reset link has been sent to your email." });
    } catch (err) {
        console.error("Error in forgot-password:", err);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Verify Reset Token
export const verifyResetToken = async (req, res, next) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            console.warn(`Invalid or expired token: ${token}`);
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        res.status(200).json({ message: "Token is valid." });
    } catch (err) {
        console.error("Error in verify-reset-token:", err);
        res.status(500).json({ message: "Server error." });
    }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            console.warn(`Invalid or expired token: ${token}`);
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
        console.error("Error in reset-password:", err);
        res.status(500).json({ message: "Server error." });
    }
};