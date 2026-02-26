const fs = require('fs');

function fixRemnants(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove any remaining {activeTab === "..." && ...}
  content = content.replace(/\{activeTab === ".*?" && ([\s\S]*?)\}/g, '$1');
  
  fs.writeFileSync(file, content, 'utf8');
}

fixRemnants('src/pages/EmployeeDashboard.jsx');
fixRemnants('src/pages/ManagerDashboard.jsx');
fixRemnants('src/pages/AdminPanel.jsx');

console.log("Remnants fixed.");
