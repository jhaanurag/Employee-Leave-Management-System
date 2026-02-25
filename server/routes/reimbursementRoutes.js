import express from "express";
import { body, param } from "express-validator";
import {
  cancelReimbursementRequest,
  createReimbursementRequest,
  getAllReimbursementsForAdmin,
  getManagerReimbursements,
  getMyReimbursements,
  reviewReimbursementRequest
} from "../controllers/reimbursementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("Employee"),
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 120 })
      .withMessage("Title must be between 3 and 120 characters"),
    body("category")
      .isIn(["Travel", "Food", "Accommodation", "Medical", "Internet", "Other"])
      .withMessage("Invalid reimbursement category"),
    body("amount")
      .isFloat({ gt: 0, max: 1000000 })
      .withMessage("Amount must be between 0.01 and 1000000"),
    body("expenseDate")
      .isISO8601()
      .withMessage("Valid expenseDate is required"),
    body("description")
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("Description must be between 5 and 500 characters")
  ],
  validateRequest,
  createReimbursementRequest
);

router.get("/my", verifyToken, authorizeRoles("Employee"), getMyReimbursements);

router.patch(
  "/:id/cancel",
  verifyToken,
  authorizeRoles("Employee"),
  [param("id").isMongoId().withMessage("Invalid reimbursement id")],
  validateRequest,
  cancelReimbursementRequest
);

router.get(
  "/manager",
  verifyToken,
  authorizeRoles("Manager"),
  getManagerReimbursements
);

router.patch(
  "/:id/review",
  verifyToken,
  authorizeRoles("Manager"),
  [
    param("id").isMongoId().withMessage("Invalid reimbursement id"),
    body("status")
      .isIn(["Approved", "Rejected"])
      .withMessage("Status must be Approved or Rejected"),
    body("remarks")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Remarks cannot exceed 500 characters")
  ],
  validateRequest,
  reviewReimbursementRequest
);

router.get(
  "/admin",
  verifyToken,
  authorizeRoles("Admin"),
  getAllReimbursementsForAdmin
);

export default router;
