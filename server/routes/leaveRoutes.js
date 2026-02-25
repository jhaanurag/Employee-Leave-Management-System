import express from "express";
import { body, param } from "express-validator";
import {
  cancelLeaveRequest,
  createLeaveRequest,
  getAllLeavesForAdmin,
  getManagerLeaves,
  getMyLeaves,
  reviewLeaveRequest
} from "../controllers/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("Employee"),
  [
    body("startDate").isISO8601().withMessage("Valid startDate is required"),
    body("endDate").isISO8601().withMessage("Valid endDate is required"),
    body("reason")
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("Reason must be between 5 and 500 characters")
  ],
  validateRequest,
  createLeaveRequest
);

router.get("/my", verifyToken, authorizeRoles("Employee"), getMyLeaves);
router.patch(
  "/:id/cancel",
  verifyToken,
  authorizeRoles("Employee"),
  [param("id").isMongoId().withMessage("Invalid leave id")],
  validateRequest,
  cancelLeaveRequest
);
router.get("/manager", verifyToken, authorizeRoles("Manager"), getManagerLeaves);
router.get("/admin", verifyToken, authorizeRoles("Admin"), getAllLeavesForAdmin);

router.patch(
  "/:id/review",
  verifyToken,
  authorizeRoles("Manager"),
  [
    param("id").isMongoId().withMessage("Invalid leave id"),
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
  reviewLeaveRequest
);

export default router;
