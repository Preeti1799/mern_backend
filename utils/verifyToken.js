import jwt from "jsonwebtoken";
import { createError } from "./error.js";

// Token Verification Middleware
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // Make sure the token is stored here

  // Log to ensure the token is present
  console.log("Token found:", token);

  if (!token) {
    console.log("No token found in cookies");
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error verifying token:", err.message);
      return next(createError(403, "Token is not valid!"));
    }

    // Log the decoded user object
    console.log("Decoded user from token:", user);

    if (!user) {
      console.log("No user found in decoded token");
      return next(createError(403, "No user information found in token!"));
    }

    req.user = user; // Assign decoded user to req.user
    next();
  });
};

// Verify if the user is the account owner or an admin
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

// Verify if the user is an admin
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      console.log("No user in request after token verification");
      return res.status(403).json({ message: "User data is missing!" });
    }

    // Check if isAdmin exists
    if (typeof req.user.isAdmin === 'undefined') {
      console.log("isAdmin is undefined in token payload");
      return res.status(500).json({ message: "'isAdmin' field is missing in token" });
    }

    if (req.user.isAdmin) {
      console.log("User is an admin");
      next();
    } else {
      console.log("User is not an admin");
      return res.status(403).json({ message: "You are not authorized!" });
    }
  });
};