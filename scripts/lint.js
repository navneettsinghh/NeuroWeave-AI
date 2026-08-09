import fs from 'node:fs';
const files = ['index.html', 'src/styles.css', 'src/app.js', 'src/services.js', 'src/demo-data.js', 'src/config/business.example.js'];
let failed = false;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('console.log(')) {
    console.error(`${file}: avoid console.log in demo runtime.`);
    failed = true;
  }
  if (/API_KEY|SECRET|TOKEN|sk-[A-Za-z0-9]/.test(text)) {
    console.error(`${file}: possible secret placeholder found.`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('Lightweight lint passed.');
