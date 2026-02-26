const fs = require('fs');

function removeTabs(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove activeTab state
  content = content.replace(/const \[activeTab, setActiveTab\] = useState\(".*?"\);\n\s*/g, '');
  
  // Remove the nav tabs section
  content = content.replace(/<div className="mt-6 border-b border-slate-200">[\s\S]*?<\/nav>\n\s*<\/div>/, '');
  
  // Replace {activeTab === "Leaves" && ( ... )} with just the content, but add a section header
  content = content.replace(/\{activeTab === "Leaves" && \(\s*<>\s*([\s\S]*?)\s*<\/>\s*\)\}/g, 
    `<div className="mt-10 mb-6 border-b border-slate-200 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h2>
        </div>
        $1`);
        
  // Replace {activeTab === "Reimbursements" && ( ... )} with just the content, but add a section header
  content = content.replace(/\{activeTab === "Reimbursements" && \(\s*<>\s*([\s\S]*?)\s*<\/>\s*\)\}/g, 
    `<div className="mt-10 mb-6 border-b border-slate-200 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reimbursements</h2>
        </div>
        $1`);
        
  // Replace {activeTab === "Users" && ( ... )} with just the content, but add a section header
  content = content.replace(/\{activeTab === "Users" && \(\s*<>\s*([\s\S]*?)\s*<\/>\s*\)\}/g, 
    `<div className="mt-10 mb-6 border-b border-slate-200 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h2>
        </div>
        $1`);

  // Remove activeTab conditions from buttons and alerts
  content = content.replace(/\{activeTab === ".*?" && \(\s*([\s\S]*?)\s*\)\}/g, '$1');
  content = content.replace(/\{activeTab === ".*?" && (.*?)\}/g, '{$1}');
  
  fs.writeFileSync(file, content, 'utf8');
}

removeTabs('src/pages/EmployeeDashboard.jsx');
removeTabs('src/pages/ManagerDashboard.jsx');
removeTabs('src/pages/AdminPanel.jsx');

console.log("Tabs removed and sections stacked successfully.");
