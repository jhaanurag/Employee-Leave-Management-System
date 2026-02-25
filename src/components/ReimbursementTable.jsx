const statusClassMap = {
  Pending: "bg-amber-200 text-amber-800",
  Approved: "bg-emerald-200 text-emerald-800",
  Rejected: "bg-rose-200 text-rose-800",
  Cancelled: "bg-gray-500 text-gray-300"
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const ReimbursementTable = ({
  reimbursements,
  showEmployee = false,
  actionable = false,
  canCancel = false,
  actionLoadingId = "",
  cancelLoadingId = "",
  remarksById = {},
  onRemarksChange = () => {},
  onAction = () => {},
  onCancel = () => {}
}) => {
  if (reimbursements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No reimbursement records found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reimbursements.map((claim) => (
        <div
          key={claim.id}
          className="bg-panel rounded-xl p-5 shadow-lg transition hover:shadow-xl"
        >
          <div className="flex justify-between">
            <div className="space-y-1">
              {showEmployee && (
                <p className="font-semibold text-gray-100">
                  {claim.employee?.name || "-"}
                </p>
              )}
              <p className="text-sm text-gray-300">
                Expense: {formatDate(claim.expenseDate)}
              </p>
              <p className="text-sm text-gray-300">Title: {claim.title}</p>
              <p className="text-sm text-gray-300">Category: {claim.category}</p>
              <p className="text-sm text-gray-300">
                Amount: {formatCurrency(claim.amount)}
              </p>
              <p className="text-sm text-gray-300">{claim.description}</p>
            </div>
            <span
              className={`status-pill ${
                statusClassMap[claim.status] || "bg-gray-700 text-gray-200"
              }`}
            >
              {claim.status}
            </span>
          </div>

          {(actionable || (canCancel && claim.status === "Pending")) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actionable && claim.status === "Pending" && (
                <>
                  <button
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    disabled={actionLoadingId === claim.id}
                    onClick={() =>
                      onAction(claim.id, "Approved", remarksById[claim.id] || "")
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                    disabled={actionLoadingId === claim.id}
                    onClick={() =>
                      onAction(claim.id, "Rejected", remarksById[claim.id] || "")
                    }
                  >
                    Reject
                  </button>
                </>
              )}
              {canCancel && claim.status === "Pending" && !actionable && (
                <button
                  className="rounded-lg border border-rose-400 bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  disabled={cancelLoadingId === claim.id}
                  onClick={() => onCancel(claim.id)}
                >
                  {cancelLoadingId === claim.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          )}

          {actionable && claim.status === "Pending" && (
            <div className="mt-2">
              <input
                type="text"
                value={remarksById[claim.id] || ""}
                onChange={(event) =>
                  onRemarksChange(claim.id, event.target.value)
                }
                placeholder="Optional remarks"
                className="input-field py-2"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReimbursementTable;
