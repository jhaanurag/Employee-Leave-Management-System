import { LEAVE_POLICY } from "../config/leavePolicy.js";
import Leave from "../models/Leave.js";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const BOOKED_STATUSES = ["Approved", "Pending"];

const toUtcDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
};

const getYearRange = (year) => ({
  start: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
  end: new Date(Date.UTC(year, 11, 31, 0, 0, 0, 0))
});

const getInclusiveDays = (start, end) =>
  Math.floor((end.getTime() - start.getTime()) / MILLISECONDS_IN_DAY) + 1;

const getOverlapDays = (start, end, rangeStart, rangeEnd) => {
  const overlapStart = start.getTime() > rangeStart.getTime() ? start : rangeStart;
  const overlapEnd = end.getTime() < rangeEnd.getTime() ? end : rangeEnd;

  if (overlapStart.getTime() > overlapEnd.getTime()) {
    return 0;
  }

  return getInclusiveDays(overlapStart, overlapEnd);
};

const getYearsInRange = (start, end) => {
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const years = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
};

const formatRelatedUser = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user === "object" && user._id) {
    return {
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || ""
    };
  }

  return {
    id: user,
    name: "",
    email: "",
    role: ""
  };
};

const formatLeave = (leave) => {
  const start = toUtcDate(leave.startDate);
  const end = toUtcDate(leave.endDate);

  return {
    id: leave._id,
    employee: formatRelatedUser(leave.employee),
    startDate: leave.startDate,
    endDate: leave.endDate,
    days: start && end ? getInclusiveDays(start, end) : 0,
    reason: leave.reason,
    status: leave.status,
    reviewedBy: formatRelatedUser(leave.reviewedBy),
    remarks: leave.remarks,
    createdAt: leave.createdAt
  };
};

const policyMeta = () => ({
  annualLimitDays: LEAVE_POLICY.annualLimitDays,
  maxRequestDays: LEAVE_POLICY.maxRequestDays,
  maxPendingRequests: LEAVE_POLICY.maxPendingRequests
});

const getBookedDaysByYear = async (employeeId, years) => {
  const firstYearRange = getYearRange(years[0]);
  const lastYearRange = getYearRange(years[years.length - 1]);

  const leaves = await Leave.find({
    employee: employeeId,
    status: { $in: BOOKED_STATUSES },
    startDate: { $lte: lastYearRange.end },
    endDate: { $gte: firstYearRange.start }
  }).select("startDate endDate status");

  const bookedByYear = Object.fromEntries(years.map((year) => [year, 0]));

  leaves.forEach((leave) => {
    const leaveStart = toUtcDate(leave.startDate);
    const leaveEnd = toUtcDate(leave.endDate);

    if (!leaveStart || !leaveEnd) {
      return;
    }

    years.forEach((year) => {
      const { start, end } = getYearRange(year);
      bookedByYear[year] += getOverlapDays(leaveStart, leaveEnd, start, end);
    });
  });

  return bookedByYear;
};

const buildEmployeeSummary = async (employeeId) => {
  const currentYear = new Date().getUTCFullYear();
  const { start, end } = getYearRange(currentYear);

  const leaves = await Leave.find({
    employee: employeeId,
    status: { $in: BOOKED_STATUSES },
    startDate: { $lte: end },
    endDate: { $gte: start }
  }).select("startDate endDate status");

  let approvedDays = 0;
  let pendingDays = 0;
  let approvedRequests = 0;

  leaves.forEach((leave) => {
    const leaveStart = toUtcDate(leave.startDate);
    const leaveEnd = toUtcDate(leave.endDate);

    if (!leaveStart || !leaveEnd) {
      return;
    }

    const overlapDays = getOverlapDays(leaveStart, leaveEnd, start, end);
    if (overlapDays <= 0) {
      return;
    }

    if (leave.status === "Approved") {
      approvedDays += overlapDays;
      approvedRequests += 1;
      return;
    }

    pendingDays += overlapDays;
  });

  const bookedDays = approvedDays + pendingDays;
  const pendingRequests = await Leave.countDocuments({
    employee: employeeId,
    status: "Pending"
  });

  return {
    year: currentYear,
    approvedDays,
    pendingDays,
    bookedDays,
    remainingDays: Math.max(LEAVE_POLICY.annualLimitDays - bookedDays, 0),
    approvedRequests,
    pendingRequests
  };
};

const getStatusSummary = (leaves) =>
  leaves.reduce(
    (summary, leave) => {
      summary[leave.status] = (summary[leave.status] || 0) + 1;
      return summary;
    },
    {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Cancelled: 0
    }
  );

export const createLeaveRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const start = toUtcDate(startDate);
    const end = toUtcDate(endDate);

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Invalid date values provided"
      });
    }

    if (start.getTime() > end.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date"
      });
    }

    const requestedDays = getInclusiveDays(start, end);
    if (requestedDays > LEAVE_POLICY.maxRequestDays) {
      return res.status(400).json({
        success: false,
        message: `A single leave request cannot exceed ${LEAVE_POLICY.maxRequestDays} day(s)`
      });
    }

    const pendingCount = await Leave.countDocuments({
      employee: req.user.id,
      status: "Pending"
    });

    if (pendingCount >= LEAVE_POLICY.maxPendingRequests) {
      return res.status(400).json({
        success: false,
        message: `You can only keep ${LEAVE_POLICY.maxPendingRequests} pending request(s) at a time`
      });
    }

    const years = getYearsInRange(start, end);
    const bookedByYear = await getBookedDaysByYear(req.user.id, years);

    for (const year of years) {
      const { start: yearStart, end: yearEnd } = getYearRange(year);
      const requestDaysInYear = getOverlapDays(start, end, yearStart, yearEnd);
      const bookedDaysInYear = bookedByYear[year] || 0;

      if (bookedDaysInYear + requestDaysInYear > LEAVE_POLICY.annualLimitDays) {
        const remainingDays = Math.max(
          LEAVE_POLICY.annualLimitDays - bookedDaysInYear,
          0
        );

        return res.status(400).json({
          success: false,
          message: `Leave balance exceeded for ${year}. Remaining days: ${remainingDays}`
        });
      }
    }

    const leave = await Leave.create({
      employee: req.user.id,
      startDate: start,
      endDate: end,
      reason: String(reason || "").trim(),
      status: "Pending"
    });

    const populated = await Leave.findById(leave._id).populate(
      "employee",
      "name email"
    );

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(201).json({
      success: true,
      message: "Leave request submitted",
      data: formatLeave(populated),
      meta: {
        policy: policyMeta(),
        summary
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(200).json({
      success: true,
      data: leaves.map((leave) => formatLeave(leave)),
      meta: {
        policy: policyMeta(),
        summary
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelLeaveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOne({
      _id: id,
      employee: req.user.id
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled"
      });
    }

    leave.status = "Cancelled";
    leave.remarks = "Cancelled by employee";
    leave.reviewedBy = null;
    await leave.save();

    const summary = await buildEmployeeSummary(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Leave request cancelled",
      data: formatLeave(leave),
      meta: {
        policy: policyMeta(),
        summary
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getManagerLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({})
      .populate("employee", "name email role")
      .populate("reviewedBy", "name email")
      .sort({ status: 1, createdAt: -1 });

    const formattedLeaves = leaves
      .map((leave) => formatLeave(leave))
      .filter((leave) => leave.employee?.role === "Employee");

    return res.status(200).json({
      success: true,
      data: formattedLeaves,
      meta: {
        summary: getStatusSummary(formattedLeaves)
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewLeaveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await Leave.findById(id).populate("employee", "name email role");
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be reviewed"
      });
    }

    const requesterRole = leave.employee?.role || "";
    const reviewerRole = req.user?.role || "";

    if (requesterRole === "Manager" && reviewerRole !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Manager leave requests can only be reviewed by Admin."
      });
    }

    if (requesterRole === "Employee" && reviewerRole !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Employee leave requests can only be reviewed by Manager."
      });
    }

    leave.status = status;
    leave.remarks = remarks || "";
    leave.reviewedBy = req.user.id;
    await leave.save();

    const populated = await Leave.findById(leave._id)
      .populate("employee", "name email role")
      .populate("reviewedBy", "name email");

    return res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()}`,
      data: formatLeave(populated)
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllLeavesForAdmin = async (req, res, next) => {
  try {
    const leaves = await Leave.find({})
      .populate("employee", "name email role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    const formattedLeaves = leaves.map((leave) => formatLeave(leave));

    return res.status(200).json({
      success: true,
      data: formattedLeaves,
      meta: {
        summary: getStatusSummary(formattedLeaves)
      }
    });
  } catch (error) {
    return next(error);
  }
};
