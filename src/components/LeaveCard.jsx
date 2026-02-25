const LeaveCard = ({ title, value, accentClass, subtitle = "", icon = "" }) => {
  // card style has been overhauled for dark theme
  return (
    <article className="rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-800 p-5 shadow-lg animate-soft-pop text-white">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-200">{title}</p>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-sm">
            {icon}
          </span>
        ) : null}
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${accentClass}`}>{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-gray-300">{subtitle}</p> : null}
    </article>
  );
};

export default LeaveCard;
