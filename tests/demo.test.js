import assert from 'node:assert';
import fs from 'node:fs';
import { businessConfig, validateBusinessConfig } from '../src/config/business.example.js';
import {
  MockLeadSource,
  MockRealEstateQualificationProvider,
  MockWhatsAppProvider,
  addActivity,
  createActivityEvent,
  detectDuplicateLead,
  evaluateFollowUpPolicy,
  normalizeLead,
  scoreLead
} from '../src/services.js';
import { demoRawLeads } from '../src/demo-data.js';

assert.equal(validateBusinessConfig(businessConfig).valid, true, 'default configuration should be valid');
const customConfig = { ...businessConfig, businessName: 'Solar Pilot', businessType: 'solar', qualificationQuestions: ['Property type', 'Monthly electricity bill', 'Roof ownership', 'Installation location', 'Purchase timeline'] };
assert.equal(validateBusinessConfig(customConfig).valid, true, 'custom configuration should be valid');
assert.equal(validateBusinessConfig({ businessName: 'Broken' }).valid, false, 'invalid configuration should fail');

const normalized = normalizeLead({ name: 'Test Lead', phone: '+91 98765 43210', email: 'TEST@EXAMPLE.COM', propertyType: 'Apartment', location: 'Powai', budget: '₹80L–₹1Cr', timeline: 'Within 30 days' }, businessConfig);
assert.equal(normalized.email, 'test@example.com', 'email should normalize');
assert.equal(normalized.phone, '+919876543210', 'phone should normalize');
assert.throws(() => normalizeLead({ name: 'No Phone' }, businessConfig), /phone is required/i, 'missing phone should fail');
assert(detectDuplicateLead({ phone: '98765 43210' }, [normalized]), 'duplicate phone should be detected');
assert(detectDuplicateLead({ email: 'test@example.com' }, [normalized]), 'duplicate email should be detected');

const hot = scoreLead(normalized, businessConfig);
assert.equal(hot.priority, 'HOT', 'hot lead should score HOT');
assert(hot.reasons.includes('Specific budget'), 'scoring should include reasons');
const warm = scoreLead({ ...normalized, timeline: '3–6 months', budget: 'Not sure yet', message: '' }, businessConfig);
assert.equal(warm.priority, 'WARM', 'medium lead should score WARM');
const cold = scoreLead({ ...normalized, timeline: 'Just researching', budget: 'Not sure yet', propertyType: 'Other', location: '', message: '' }, businessConfig);
assert.equal(cold.priority, 'COLD', 'weak lead should score COLD');

const ai = new MockRealEstateQualificationProvider();
const qualified = await ai.qualifyLead(normalized, [{}, {}, {}], businessConfig);
assert.equal(qualified.qualification_status, 'qualified', 'qualification should succeed');
const incomplete = await ai.qualifyLead(normalized, [], businessConfig);
assert.equal(incomplete.qualification_status, 'incomplete', 'empty conversation should be incomplete');
await assert.rejects(() => new MockRealEstateQualificationProvider({ available: false }).qualifyLead(normalized), /unavailable/, 'AI provider failure should surface');

const followupHot = evaluateFollowUpPolicy({ ...normalized, priority: 'HOT', humanActive: false }, businessConfig, new Date('2026-08-09T10:00:00'));
assert.equal(followupHot.urgency, 'high', 'hot lead should recommend immediate follow-up');
const inactiveWarm = evaluateFollowUpPolicy({ ...normalized, priority: 'WARM', lastActivityAt: '2026-08-07T10:00:00Z' }, businessConfig, new Date('2026-08-09T10:00:00Z'));
assert.equal(inactiveWarm.urgency, 'medium', 'inactive warm lead should need follow-up');
const outsideHours = evaluateFollowUpPolicy({ ...normalized, priority: 'HOT' }, businessConfig, new Date('2026-08-09T22:00:00'));
assert.equal(outsideHours.urgency, 'scheduled', 'outside working hours should schedule follow-up');

const source = new MockLeadSource(demoRawLeads, businessConfig);
const raw = await source.receiveLead(0);
assert.equal(raw.name, 'Rahul Sharma', 'mock lead source should return demo lead');
assert.equal(source.normalizeLead(raw).phone, '+919876511111', 'mock lead source should normalize');
await assert.rejects(() => source.receiveLead(99), /No mock lead/, 'lead source failure should surface');

const whatsapp = new MockWhatsAppProvider();
assert.equal((await whatsapp.sendMessage('+919876543210', 'Hello')).ok, true, 'mock WhatsApp should send');
await assert.rejects(() => new MockWhatsAppProvider({ available: false }).sendMessage('+919876543210', 'Hello'), /unavailable/, 'WhatsApp provider failure should surface');

const activity = createActivityEvent('lead_created', normalized.id, 'Lead captured', { source: 'test' });
assert.equal(activity.type, 'lead_created', 'activity event should include type');
addActivity(normalized, 'appointment_booked', 'Appointment booked');
assert(normalized.activities.some((event) => event.type === 'appointment_booked'), 'timeline should include appointment event');

const html = fs.readFileSync('index.html', 'utf8');
for (const text of ['Experience Live Demo', 'Demo Mode', 'Human Takeover', 'Revenue Leak Detector', 'Opportunity Command Center', 'Request a Pilot', 'prospect-form', 'duplicate-notice', 'environment-indicator']) {
  assert(html.includes(text), `${text} should be present`);
}
const app = fs.readFileSync('src/app.js', 'utf8');
for (const text of ['demo_started', 'demo_lead_loaded', 'lead_created', 'qualification_completed', 'hot_lead_viewed', 'human_takeover_clicked', 'mark_booked_clicked', 'pilot_cta_clicked', 'contact_form_submitted', 'duplicate_lead_detected']) {
  assert(app.includes(text), `${text} event should be tracked`);
}
for (const file of ['DEMO-SCRIPT.md', 'SALES.md', 'PILOT-OFFER.md', 'PILOT-ONBOARDING.md', 'PILOT-ACCEPTANCE.md', 'ARCHITECTURE.md', 'INTEGRATIONS.md']) {
  assert(fs.existsSync(file), `${file} should exist`);
}
console.log('Demo behavior tests passed.');
