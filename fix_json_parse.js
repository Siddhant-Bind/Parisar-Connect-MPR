const fs = require('fs');
const path = require('path');

const baseDir = 'd:\\MY_Storage(D)\\Data\\Projects_SoRion\\SEM4_MPR_PROJECT';

const files = [
  'client\\src\\pages\\dashboard\\AdminApprovals.tsx',
  'client\\src\\pages\\dashboard\\AdminDashboard.tsx',
  'client\\src\\pages\\dashboard\\Complaints.tsx',
  'client\\src\\pages\\dashboard\\GuardDashboard.tsx',
  'client\\src\\pages\\dashboard\\Guards.tsx',
  'client\\src\\pages\\dashboard\\Notices.tsx',
  'client\\src\\pages\\dashboard\\Payments.tsx',
  'client\\src\\pages\\dashboard\\Reports.tsx',
  'client\\src\\pages\\dashboard\\Residents.tsx',
  'client\\src\\pages\\dashboard\\Visitors.tsx',
  'client\\src\\pages\\dashboard\\ResidentDashboard.tsx',
  'client\\src\\pages\\dashboard\\resident\\ResidentComplaints.tsx',
  'client\\src\\pages\\dashboard\\resident\\ResidentVisitors.tsx',
  'client\\src\\pages\\dashboard\\guard\\TodaysLog.tsx',
  'client\\src\\pages\\dashboard\\guard\\VisitorHistory.tsx',
  'client\\src\\pages\\dashboard\\guard\\GuardDashboard.tsx',
  'client\\src\\pages\\dashboard\\guard\\AddVisitorPage.tsx',
];

let changed = 0;

for (const relPath of files) {
  const fullPath = path.join(baseDir, relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Add import if not present
  if (!content.includes('safeParseJSON')) {
    if (content.includes('import api from "@/lib/api"')) {
      content = content.replace(
        'import api from "@/lib/api";',
        'import api from "@/lib/api";\nimport { safeParseJSON } from "@/lib/utils";'
      );
      modified = true;
    } else {
      // Add after last import line
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trimStart().startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, 'import { safeParseJSON } from "@/lib/utils";');
        content = lines.join('\n');
        modified = true;
      }
    }
  }

  // Pattern 1: JSON.parse(localStorage.getItem("user") || "{}")
  const p1 = 'JSON.parse(localStorage.getItem("user") || "{}")';
  const r1 = 'safeParseJSON(localStorage.getItem("user"), {})';
  while (content.includes(p1)) {
    content = content.replace(p1, r1);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changed++;
    console.log('Fixed: ' + relPath);
  } else {
    console.log('Skipped: ' + relPath);
  }
}

console.log('\nTotal files modified: ' + changed);
