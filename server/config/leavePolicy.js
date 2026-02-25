const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export const LEAVE_POLICY = {
  annualLimitDays: toPositiveInteger(process.env.LEAVE_ANNUAL_LIMIT_DAYS, 24),
  maxRequestDays: toPositiveInteger(process.env.LEAVE_MAX_REQUEST_DAYS, 10),
  maxPendingRequests: toPositiveInteger(process.env.LEAVE_MAX_PENDING_REQUESTS, 3)
};
