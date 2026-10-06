const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(srcDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace plain strings in single quotes: 'http://localhost:5000/api/...' -> `${import.meta.env.VITE_API_URL}/api/...`
  content = content.replace(/'http:\/\/localhost:5000([^']+)'/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Replace plain strings in double quotes: "http://localhost:5000/api/..." -> `${import.meta.env.VITE_API_URL}/api/...`
  content = content.replace(/"http:\/\/localhost:5000([^"]+)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Replace already inside template literals: `http://localhost:5000/...` -> `${import.meta.env.VITE_API_URL}/...`
  content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL}');
  
  // Now there might be double nested `${import.meta.env.VITE_API_URL}` if it was already replaced by the first rules but then matched the third rule? No, the third rule matches the raw string. But the first two removed it!
  // Oh wait, the third rule replaces it if it's in a template literal (or anywhere). 
  // Wait, if I do the third rule ONLY, it replaces all occurrences!
  // BUT if it's inside single quotes, e.g. axios.get('http://...'), turning it into axios.get('${...}') will not work because it's single quotes, not backticks!
  // So the first two rules are crucial for converting to backticks.
  // Let me just rewrite content from scratch with better regex:

  let newContent = originalContent;
  
  // Single quotes to backticks
  newContent = newContent.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Double quotes to backticks
  newContent = newContent.replace(/"http:\/\/localhost:5000(.*?)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Already in backticks
  newContent = newContent.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${import.meta.env.VITE_API_URL}$1`');

  if (newContent !== originalContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${changedFiles} files.`);
