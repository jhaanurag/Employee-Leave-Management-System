const fs = require('fs');

// 1. Update Tailwind Config (New Indigo Accent Color)
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(/brand: \{[\s\S]*?\},/, `brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },`);
fs.writeFileSync('tailwind.config.js', tw);

// 2. Fix Sidebar Width & Styling
let sidebar = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace('<div className="px-4 pt-4 md:px-6 md:pt-6">\n      <header', '<header');
sidebar = sidebar.replace('</header>\n    </div>', '</header>');
sidebar = sidebar.replace(
  'w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm',
  'w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm'
);
fs.writeFileSync('src/components/Sidebar.jsx', sidebar);

// 3. Fix Typography & Contrast in index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(
  '.app-shell {\n    @apply mx-auto flex min-h-screen w-full max-w-7xl px-4 py-5 md:px-6 md:py-7;\n  }',
  '.app-shell {\n    @apply mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-8 md:py-8;\n  }'
);
css = css.replace(
  '.page-title {\n    @apply text-2xl font-extrabold text-slate-900 md:text-3xl;\n  }',
  '.page-title {\n    @apply text-2xl font-bold tracking-tight text-slate-900 md:text-3xl;\n  }'
);
css = css.replace(
  '.page-kicker {\n    @apply text-xs font-bold uppercase tracking-[0.18em] text-brand-700;\n  }',
  '.page-kicker {\n    @apply text-xs font-bold uppercase tracking-widest text-brand-600;\n  }'
);
fs.writeFileSync('src/index.css', css);

// 4. Fix Login.jsx Contrast (Make left panel brand colored)
let login = fs.readFileSync('src/pages/Login.jsx', 'utf8');
login = login.replace(
  /<section className="card hidden p-8 md:block">[\s\S]*?<\/section>/,
  `<section className="card hidden p-8 md:flex flex-col justify-center bg-brand-600 text-white border-none shadow-xl">
          <div className="max-w-md animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-200">Employee Leave Management</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white">
              A cleaner way to manage leave workflows.
            </h1>
            <p className="mt-4 text-sm leading-6 text-brand-100">
              Apply, review, and manage leave requests with role-based dashboards and policy-driven controls.
            </p>
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-brand-500 bg-brand-700/50 p-4">
                <p className="text-sm font-semibold text-white">Role-aware access</p>
                <p className="mt-1 text-xs text-brand-100">
                  Admin, manager, and employee experiences are separated by policy.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-500 bg-brand-700/50 p-4">
                <p className="text-sm font-semibold text-white">Live leave balance</p>
                <p className="mt-1 text-xs text-brand-100">
                  Employees see remaining balance and request limits before applying.
                </p>
              </div>
            </div>
          </div>
        </section>`
);
fs.writeFileSync('src/pages/Login.jsx', login);

console.log("UI fixes applied successfully.");
