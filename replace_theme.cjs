const fs = require('fs');
const path = require('path');

const replacements = {
  'text-gray-100': 'text-slate-900',
  'text-gray-200': 'text-slate-700',
  'text-gray-300': 'text-slate-600',
  'text-gray-400': 'text-slate-500',
  'bg-gray-800': 'bg-white',
  'bg-gray-700': 'bg-slate-50',
  'bg-gray-600': 'bg-slate-100',
  'border-gray-600': 'border-slate-200',
  'border-gray-700': 'border-slate-200',
  'hover:bg-gray-700': 'hover:bg-slate-100',
  'hover:bg-gray-600': 'hover:bg-slate-200',
  'hover:border-gray-600': 'hover:border-slate-300',
  'text-slate-200': 'text-slate-700',
  'text-slate-300': 'text-slate-600',
  'text-slate-400': 'text-slate-500',
  'bg-slate-800': 'bg-white',
  'bg-slate-700': 'bg-slate-50',
  'bg-slate-600': 'bg-slate-100',
  'border-slate-600': 'border-slate-200',
  'border-slate-700': 'border-slate-200',
  'hover:bg-slate-700': 'hover:bg-slate-100',
  'hover:bg-slate-600': 'hover:bg-slate-200',
  'hover:border-slate-600': 'hover:border-slate-300',
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
