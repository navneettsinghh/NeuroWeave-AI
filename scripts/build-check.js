import fs from 'node:fs';
const required = ['index.html', 'src/styles.css', 'src/app.js', 'src/services.js', 'src/demo-data.js', 'src/config/business.example.js', 'DEMO-SCRIPT.md', 'SALES.md', 'PILOT-OFFER.md', 'PILOT-ONBOARDING.md', 'PILOT-ACCEPTANCE.md', 'ARCHITECTURE.md', 'INTEGRATIONS.md'];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error(`Missing build files: ${missing.join(', ')}`);
  process.exit(1);
}
const html = fs.readFileSync('index.html', 'utf8');
for (const marker of ['Turn every property enquiry into an opportunity.', 'Experience Live Demo', 'Opportunity Command Center', 'Revenue Leak Detector', 'Request a Pilot', 'prospect-form', 'duplicate-notice', 'environment-indicator']) {
  if (!html.includes(marker)) {
    console.error(`Missing required demo marker: ${marker}`);
    process.exit(1);
  }
}
console.log('Static build check passed.');
