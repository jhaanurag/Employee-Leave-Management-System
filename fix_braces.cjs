const fs = require('fs');

let content = fs.readFileSync('src/pages/EmployeeDashboard.jsx', 'utf8');

content = content.replace(/showReimbursementForm \? \(\s*<form\s*className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"\s*onSubmit=\{onReimbursementSubmit\s*>/, 
  `{showReimbursementForm ? (
            <form
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
              onSubmit={onReimbursementSubmit}
            >`);

fs.writeFileSync('src/pages/EmployeeDashboard.jsx', content, 'utf8');
console.log("Braces fixed.");
