import mongoose from "mongoose";

const reimbursementSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    category: {
      type: String,
      enum: ["Travel", "Food", "Accommodation", "Medical", "Internet", "Other"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1000000
    },
    expenseDate: {
      type: Date,
      required: true
    },
    description: {
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

reimbursementSchema.index({ employee: 1, createdAt: -1 });
reimbursementSchema.index({ status: 1, createdAt: -1 });

const Reimbursement = mongoose.model("Reimbursement", reimbursementSchema);

export default Reimbursement;
