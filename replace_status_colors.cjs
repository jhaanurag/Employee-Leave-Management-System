const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-rose-800': 'bg-rose-50',
  'border-rose-600': 'border-rose-200',
  'text-rose-100': 'text-rose-700',
  'bg-rose-700': 'bg-rose-100',
  
  'bg-emerald-800': 'bg-emerald-50',
  'border-emerald-600': 'border-emerald-200',
  'text-emerald-100': 'text-emerald-700',
  'bg-emerald-700': 'bg-emerald-100',
  
  'bg-amber-800': 'bg-amber-50',
  'border-amber-600': 'border-amber-200',
  'text-amber-100': 'text-amber-700',
  'bg-amber-700': 'bg-amber-100',
  
  'bg-blue-800': 'bg-blue-50',
  'border-blue-600': 'border-blue-200',
  'text-blue-100': 'text-blue-700',
  'bg-blue-700': 'bg-blue-100',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
