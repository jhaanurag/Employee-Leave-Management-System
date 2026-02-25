import Reimbursement from "../models/Reimbursement.js";

const REIMBURSEMENT_CATEGORIES = [
  "Travel",
  "Food",
  "Accommodation",
  "Medical",
  "Internet",
  "Other"
];

const parseDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatRelatedUser = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user === "object" && user._id) {
    return {
      id: user._id,
      name: user.name || "",
      email: user.email || ""
    };
  }

  return {
    id: user,
    name: "",
    email: ""
  };
};

const roundToTwo = (value) => Math.round(Number(value || 0) * 100) / 100;

const formatReimbursement = (reimbursement) => ({
  id: reimbursement._id,
  employee: formatRelatedUser(reimbursement.employee),
  title: reimbursement.title,
  category: reimbursement.category,
  amount: roundToTwo(reimbursement.amount),
  expenseDate: reimbursement.expenseDate,
  description: reimbursement.description,
  status: reimbursement.status,
  reviewedBy: formatRelatedUser(reimbursement.reviewedBy),
  remarks: reimbursement.remarks,
  createdAt: reimbursement.createdAt
});

const getStatusSummary = (claims) =>
  claims.reduce(
    (summary, claim) => {
      summary[claim.status] = (summary[claim.status] || 0) + 1;
      summary.totalAmount = roundToTwo(summary.totalAmount + claim.amount);

      if (claim.status === "Approved") {
        summary.approvedAmount = roundToTwo(summary.approvedAmount + claim.amount);
      }

      if (claim.status === "Pending") {
        summary.pendingAmount = roundToTwo(summary.pendingAmount + claim.amount);
      }

      return summary;
    },
    {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Cancelled: 0,
      totalAmount: 0,
      approvedAmount: 0,
      pendingAmount: 0
    }
  );

const buildEmployeeSummary = async (employeeId) => {
  const claims = await Reimbursement.find({ employee: employeeId }).select(
    "status amount"
  );

  return getStatusSummary(claims.map((claim) => formatReimbursement(claim)));
};

export const reimbursementMeta = () => ({
  categories: REIMBURSEMENT_CATEGORIES
});

export const createReimbursementRequest = async (req, res, next) => {
  try {
    const { title, category, amount, expenseDate, description } = req.body;

    const parsedDate = parseDate(expenseDate);
    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date"
      });
    }

    const now = new Date();
    if (parsedDate.getTime() > now.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Expense date cannot be in the future"
      });
    }

    const claim = await Reimbursement.create({
      employee: req.user.id,
      title: String(title || "").trim(),
      category,
      amount: roundToTwo(amount),
      expenseDate: parsedDate,
      description: String(description || "").trim(),
      status: "Pending"
    });

    const populated = await Reimbursement.findById(claim._id).populate(
      "employee",
      "name email"
    );

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(201).json({
      success: true,
      message: "Reimbursement request submitted",
      data: formatReimbursement(populated),
      meta: {
        summary,
        reimbursement: reimbursementMeta()
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyReimbursements = async (req, res, next) => {
  try {
    const claims = await Reimbursement.find({ employee: req.user.id })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(200).json({
      success: true,
      data: claims.map((claim) => formatReimbursement(claim)),
      meta: {
        summary,
        reimbursement: reimbursementMeta()
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelReimbursementRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const claim = await Reimbursement.findOne({
      _id: id,
      employee: req.user.id
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement request not found"
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reimbursement requests can be cancelled"
      });
    }

    claim.status = "Cancelled";
    claim.remarks = "Cancelled by employee";
    claim.reviewedBy = null;
    await claim.save();

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Reimbursement request cancelled",
      data: formatReimbursement(claim),
      meta: {
        summary,
        reimbursement: reimbursementMeta()
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getManagerReimbursements = async (req, res, next) => {
  try {
    const claims = await Reimbursement.find({})
      .populate("employee", "name email")
      .populate("reviewedBy", "name email")
      .sort({ status: 1, createdAt: -1 });

    const formattedClaims = claims.map((claim) => formatReimbursement(claim));

    return res.status(200).json({
      success: true,
      data: formattedClaims,
      meta: {
        summary: getStatusSummary(formattedClaims),
        reimbursement: reimbursementMeta()
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewReimbursementRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const claim = await Reimbursement.findById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement request not found"
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reimbursement requests can be reviewed"
      });
    }

    claim.status = status;
    claim.remarks = remarks || "";
    claim.reviewedBy = req.user.id;
    await claim.save();

    const populated = await Reimbursement.findById(claim._id)
      .populate("employee", "name email")
      .populate("reviewedBy", "name email");

    return res.status(200).json({
      success: true,
      message: `Reimbursement request ${status.toLowerCase()}`,
      data: formatReimbursement(populated)
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllReimbursementsForAdmin = async (req, res, next) => {
  try {
    const claims = await Reimbursement.find({})
      .populate("employee", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const formattedClaims = claims.map((claim) => formatReimbursement(claim));

    return res.status(200).json({
      success: true,
      data: formattedClaims,
      meta: {
        summary: getStatusSummary(formattedClaims),
        reimbursement: reimbursementMeta()
      }
    });
  } catch (error) {
    return next(error);
  }
};
