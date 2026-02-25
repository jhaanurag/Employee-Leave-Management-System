import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    remarks: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, createdAt: -1 });
leaveSchema.index({ status: 1, createdAt: -1 });

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
