import express from "express";
import { body } from "express-validator";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  loginUser
);

router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", verifyToken, logoutUser);

export default router;
