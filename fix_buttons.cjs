const fs = require('fs');

let content = fs.readFileSync('src/pages/EmployeeDashboard.jsx', 'utf8');

// Fix the broken button syntax caused by the regex replacement
content = content.replace(/<button\s+className="btn-primary"\s+onClick=\{\(\) => setShowLeaveForm\(\(current\) => !current\s+type="button"\s+>\s+\{showLeaveForm \? "Close Leave Form" : "Apply Leave"\}\s+<\/button>\s+\)\}/g, 
  `<button
                className="btn-primary"
                onClick={() => setShowLeaveForm((current) => !current)}
                type="button"
              >
                {showLeaveForm ? "Close Leave Form" : "Apply Leave"}
              </button>`);

content = content.replace(/<button\s+className="btn-primary"\s+onClick=\{\(\) => setShowReimbursementForm\(\(current\) => !current\s+type="button"\s+>\s+\{showReimbursementForm \? "Close Reimbursement Form" : "Claim Reimbursement"\}\s+<\/button>\s+\)\}/g, 
  `<button
                className="btn-primary"
                onClick={() => setShowReimbursementForm((current) => !current)}
                type="button"
              >
                {showReimbursementForm ? "Close Reimbursement Form" : "Claim Reimbursement"}
              </button>`);

fs.writeFileSync('src/pages/EmployeeDashboard.jsx', content, 'utf8');
console.log("Buttons fixed.");
