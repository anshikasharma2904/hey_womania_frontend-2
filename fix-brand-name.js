const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
             results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function processFiles(files) {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace "HeyWomaniyaa" -> "Hey Womaniyaa"
    // Replace "Hey womaniya" -> "Hey Womaniyaa"
    // Replace "Hey Womaniya" -> "Hey Womaniyaa"
    // Use regex negative lookbehinds/lookaheads to prevent changing emails or URLs
    // We don't want to change: @heywomaniyaa.com, heywomaniyaa.com, /heywomaniya
    
    // First, let's safely target text that matches the brand name
    // Regex matches "Hey" optionally followed by space, then "Womaniya" with optional "a"s
    // but ONLY if it's not preceded by '@', '/', '.', and not followed by '.'
    
    const regex = /(?<![@\/\.])\bHey\s*Womaniyaa?\b(?!\.com|\.in)/gi;
    
    content = content.replace(regex, (match) => {
        // preserve casing if we really need to, but user said change to "Hey Womaniyaa"
        return "Hey Womaniyaa";
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', file);
    }
  });
}

walk('./app', (err, appFiles) => {
  walk('./components', (err, compFiles) => {
     processFiles([...appFiles, ...compFiles]);
  });
});
