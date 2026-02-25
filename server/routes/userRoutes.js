import express from "express";
import { body, param } from "express-validator";
import {
  createUser,
  getUsers,
  updateUserRole
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles("Admin"));

router.get("/", getUsers);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["Admin", "Manager", "Employee"])
      .withMessage("Role must be Admin, Manager, or Employee")
  ],
  validateRequest,
  createUser
);

router.patch(
  "/:id/role",
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("role")
      .isIn(["Admin", "Manager", "Employee"])
      .withMessage("Role must be Admin, Manager, or Employee")
  ],
  validateRequest,
  updateUserRole
);

export default router;
