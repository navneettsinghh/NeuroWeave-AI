import { businessConfig } from './config/business.example.js';
import { appModes, demoCommandCenter, demoConversation, demoEnvironment, demoRawLeads, pilotCommandCenter } from './demo-data.js';
import {
  MockLeadSource,
  MockRealEstateQualificationProvider,
  MockWhatsAppProvider,
  addActivity,
  detectDuplicateLead,
  evaluateFollowUpPolicy,
  normalizeLead,
  scoreLead,
  createId,
  nowIso
} from './services.js';

const statuses = ['New', 'Contacted', 'Qualified', 'Hot', 'Booked', 'Lost'];
const progressStages = ['Lead', 'Qualify', 'Prioritize', 'Follow Up', 'Book'];
const contactDestination = businessConfig.contact.email;
const leadSource = new MockLeadSource(demoRawLeads, businessConfig);
const aiProvider = new MockRealEstateQualificationProvider();
const whatsappProvider = new MockWhatsAppProvider();
let appMode = demoEnvironment.mode;
let activeConfig = demoEnvironment.businessConfig;
let commandCenter = demoEnvironment.commandCenter;
let humanActive = false;
let selectedLeadId = '';
let activeLeadId = '';
let currentStage = 1;
let duplicateCandidate = null;
let leads = [];

function message(speaker, text) { return { id: createId('msg'), speaker, text, createdAt: nowIso() }; }
function trackEvent(name, metadata = {}) {
  const safeMetadata = { ...metadata };
  delete safeMetadata.phone;
  delete safeMetadata.email;
  const events = JSON.parse(localStorage.getItem('convertiq_events') || '[]');
  events.push({ name, metadata: safeMetadata, createdAt: nowIso() });
  localStorage.setItem('convertiq_events', JSON.stringify(events.slice(-80)));
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function getLead(id) { return leads.find((lead) => lead.id === id) || leads[0]; }

function initializeLead(rawLead, config = activeConfig) {
  const lead = normalizeLead(rawLead, config);
  addActivity(lead, 'lead_created', 'Lead captured', { source: lead.source });
  const scoring = scoreLead(lead, config);
  applyScoring(lead, scoring);
  addActivity(lead, 'lead_scored', `Lead prioritized as ${lead.priority}`, { score: lead.score, priority: lead.priority });
  const policy = evaluateFollowUpPolicy(lead, config);
  if (policy.shouldFollowUp) addActivity(lead, 'followup_recommended', policy.recommendedAction, { urgency: policy.urgency, reason: policy.reason });
  return lead;
}

function applyScoring(lead, scoring) {
  lead.score = scoring.score;
  lead.priority = scoring.priority;
  lead.reasons = scoring.reasons;
  if (lead.priority === 'HOT') lead.status = 'Hot';
  else if (lead.priority === 'WARM' && lead.status === 'New') lead.status = 'Qualified';
  lead.intent = lead.priority === 'HOT' ? 'High purchase intent' : lead.priority === 'WARM' ? 'Active comparison' : 'Early research';
  lead.aiSummary = `${lead.priority}-priority buyer looking for ${lead.propertyType.toLowerCase()} in ${lead.location || 'their preferred area'} with a ${lead.budget} budget. Purchase timeline: ${lead.timeline}.`;
  lead.nextAction = lead.priority === 'HOT' ? 'Contact this lead within 5 minutes and share 2–3 matching properties.' : 'Share matching inventory and schedule a follow-up.';
}

function seedLeads(mode = appModes.DEMO) {
  appMode = mode;
  if (mode === appModes.PILOT) {
    commandCenter = pilotCommandCenter;
    return [];
  }
  commandCenter = demoCommandCenter;
  return demoRawLeads.map((rawLead, index) => {
    const lead = initializeLead(rawLead, activeConfig);
    lead.createdAt = new Date(Date.now() - (index + 1) * 1800000).toISOString();
    lead.updatedAt = lead.createdAt;
    lead.lastActivityAt = lead.createdAt;
    return lead;
  });
}

function render() {
  const selected = getLead(selectedLeadId);
  if (!selected) return;
  const active = getLead(activeLeadId || selectedLeadId);
  renderEnvironment(); renderProgress(); renderStory(selected); renderChat(active); renderMetrics(); renderRecommendations(); renderPipeline(); renderDetails(selected); renderDuplicateNotice();
  document.getElementById('active-state').textContent = humanActive ? 'Human Active' : 'AI Active';
}

function renderEnvironment() {
  document.getElementById('environment-indicator').textContent = `${appMode} MODE · ${activeConfig.businessName}`;
}
function renderProgress() {
  document.getElementById('demo-progress').innerHTML = progressStages.map((stage, index) => `<div class="progressStep ${index + 1 <= currentStage ? 'active' : ''}"><span>${String(index + 1).padStart(2, '0')}</span>${stage}</div>`).join('');
}
function renderStory(lead) {
  const hot = lead.priority === 'HOT';
  document.getElementById('story-panel').innerHTML = `<div><p class="eyebrow">Step ${currentStage}</p><h2>${storyTitle()}</h2><p>${storyCopy(lead)}</p></div><aside class="alert"><p>${hot ? '🔥 HOT LEAD' : 'AI LEAD PRIORITY'}</p><h3>${escapeHtml(lead.name)} ${hot ? 'is ready for agent follow-up.' : 'has a clear next step.'}</h3><span>${escapeHtml(lead.budget)} · ${escapeHtml(lead.location)} · ${escapeHtml(lead.propertyType)} · ${escapeHtml(lead.timeline)}</span><button class="pilot-cta" type="button">Contact this lead</button></aside>`;
}
function storyTitle() { return ['New lead detected', 'AI qualifies the buyer', 'AI identifies high intent', 'Agent receives recommendation', 'Appointment booked'][Math.max(0, currentStage - 1)]; }
function storyCopy(lead) {
  const copy = [`${lead.name} has arrived from a property enquiry source and is ready for instant follow-up.`, 'CONVERTIQ responds on WhatsApp and captures configured qualification fields.', `The lead is marked ${lead.priority} with a transparent ${lead.score}/100 AI Lead Priority score.`, lead.nextAction, `${lead.name} is moved to Booked once the agent confirms the next conversation or viewing.`];
  return copy[Math.max(0, currentStage - 1)];
}
function renderChat(lead) {
  const chat = document.getElementById('chat');
  chat.innerHTML = lead.conversation.length ? lead.conversation.map((msg) => `<div class="bubble ${msg.speaker}">${escapeHtml(msg.text)}</div>`).join('') : '<p class="empty">Enable Demo Mode or create a lead to start the simulated WhatsApp conversation.</p>';
  chat.scrollTop = chat.scrollHeight;
}
function renderMetrics() {
  document.getElementById('metrics').innerHTML = Object.entries(commandCenter.metrics).map(([label, value]) => `<div class="metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('');
}
function renderRecommendations() {
  document.getElementById('recommended-actions').innerHTML = commandCenter.recommendations.map((action) => `<div class="actionItem"><span>${escapeHtml(action)}</span><button class="pilot-cta" type="button">Take action</button></div>`).join('');
}
function renderPipeline() {
  document.getElementById('pipeline').innerHTML = statuses.map((status) => `<div class="column"><h3>${status}</h3>${leads.filter((lead) => lead.status === status).map((lead) => `<button class="leadCard ${selectedLeadId === lead.id ? 'selected' : ''}" data-select="${lead.id}" type="button"><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.propertyType)} · ${escapeHtml(lead.location)}</span><span>${escapeHtml(lead.budget)} · ${escapeHtml(lead.timeline)}</span><em>${lead.priority} · ${lead.score}/100</em><small>${new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></button>`).join('') || '<p class="empty small">No leads</p>'}</div>`).join('');
}
function renderActivity(lead) {
  return (lead.activities || []).map((event) => `<li><time>${new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><span>${escapeHtml(event.description)}</span></li>`).join('');
}
function renderDetails(lead) {
  const reasons = (lead.reasons || []).map((reason) => `<li>✓ ${escapeHtml(reason)}</li>`).join('');
  document.getElementById('details').innerHTML = `<div><p class="eyebrow">Lead detail</p><h2>${escapeHtml(lead.name)}</h2><p>${escapeHtml(lead.phone)}${lead.email ? ` · ${escapeHtml(lead.email)}` : ''}</p></div><div class="detailGrid"><div><h3>Requirement</h3><p>${escapeHtml(lead.propertyType)}</p><p>${escapeHtml(lead.location)}</p><p>${escapeHtml(lead.budget)}</p><p>${escapeHtml(lead.timeline)}</p><h3>Activity</h3><ul class="activityList">${renderActivity(lead)}</ul></div><div><h3>Why CONVERTIQ prioritized this lead</h3><ul class="reasonList">${reasons}</ul><h3>AI Lead Priority</h3><strong class="priority ${lead.priority.toLowerCase()}">${lead.priority} · ${lead.score}/100</strong></div><div><h3>AI Summary</h3><p>${escapeHtml(lead.aiSummary)}</p><h3>Recommended next action</h3><p>${escapeHtml(lead.nextAction)}</p><div class="actions wrap"><a class="button secondary" href="tel:${escapeHtml(lead.phone)}">Call Lead</a><button data-open="${lead.id}" type="button">Open WhatsApp</button><button type="button">Assign Agent</button><button data-book="${lead.id}" type="button">Mark Booked</button></div></div></div>`;
}
function renderDuplicateNotice() {
  const notice = document.getElementById('duplicate-notice');
  if (!duplicateCandidate) { notice.hidden = true; notice.innerHTML = ''; return; }
  notice.hidden = false;
  notice.innerHTML = `<strong>Existing lead found.</strong><p>${escapeHtml(duplicateCandidate.name)} already exists. Open the existing lead or create a new interaction.</p><div class="actions"><button type="button" data-open-duplicate="${duplicateCandidate.id}">Open Existing Lead</button><button type="button" data-create-interaction="${duplicateCandidate.id}">Create New Interaction</button></div>`;
}

async function submitLead(event) {
  event.preventDefault();
  clearFormError();
  let baseLead;
  try {
    baseLead = normalizeLead({ ...getFormData(), source: appMode === appModes.DEMO ? 'demo-form' : 'pilot-form' }, activeConfig);
  } catch (error) {
    setFormError(error.message || 'Invalid lead. Please continue manually.');
    return;
  }
  const existing = detectDuplicateLead(baseLead, leads);
  if (existing) {
    duplicateCandidate = existing;
    trackEvent('duplicate_lead_detected', { leadId: existing.id });
    renderDuplicateNotice();
    return;
  }
  await createLeadFromNormalized(baseLead);
}

async function createLeadFromNormalized(baseLead) {
  const conversation = buildConversation(baseLead);
  baseLead.conversation = conversation;
  addActivity(baseLead, 'lead_created', 'Lead captured', { source: baseLead.source });
  try {
    const qualified = await aiProvider.qualifyLead(baseLead, conversation, activeConfig);
    applyScoring(baseLead, { score: qualified.lead_score, priority: qualified.priority, reasons: qualified.reasons });
    baseLead.intent = qualified.intent;
    addActivity(baseLead, 'lead_qualified', 'AI qualification completed', { status: qualified.qualification_status });
    addActivity(baseLead, 'lead_scored', `Lead prioritized as ${baseLead.priority}`, { score: baseLead.score });
    const reply = await aiProvider.generateReply(baseLead, conversation, activeConfig);
    addActivity(baseLead, 'message_generated', 'AI reply generated', { provider: 'mock' });
    await whatsappProvider.sendMessage(baseLead.phone, reply);
    addActivity(baseLead, 'message_sent', 'Mock WhatsApp message sent', { provider: 'mock' });
    baseLead.conversation = [...conversation, message('ai', reply)];
  } catch (error) {
    baseLead.nextAction = 'AI assistance is temporarily unavailable. Continue manually.';
    baseLead.conversation = [...conversation, message('system', baseLead.nextAction)];
    addActivity(baseLead, 'followup_recommended', baseLead.nextAction, { error: error.message });
  }
  const policy = evaluateFollowUpPolicy(baseLead, activeConfig);
  if (policy.shouldFollowUp) addActivity(baseLead, 'followup_recommended', policy.recommendedAction, { urgency: policy.urgency, reason: policy.reason });
  leads = [baseLead, ...leads]; selectedLeadId = baseLead.id; activeLeadId = baseLead.id; humanActive = false; currentStage = 3; duplicateCandidate = null;
  trackEvent('lead_created', { priority: baseLead.priority }); trackEvent('qualification_completed', { score: baseLead.score }); render(); document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

function buildConversation(lead) {
  const firstName = lead.name.split(' ')[0];
  const nextQuestion = activeConfig.qualificationQuestions.find((question) => !lead[question.key]);
  const qualificationPrompt = nextQuestion ? `Could you share your ${nextQuestion.label.toLowerCase()}?` : 'I have the key details. Would you like an agent to share matching properties?';
  return [message('lead', lead.message || `Hi, I’m interested in a ${lead.propertyType.toLowerCase()} near ${lead.location}.`), message('ai', `Hi ${firstName} 👋 Thanks for reaching out to ${activeConfig.businessName}. ${qualificationPrompt}`), message('lead', `${lead.budget}.`), message('ai', 'Great. Are you looking to purchase immediately or within the next few months?'), message('lead', lead.timeline)];
}
function getFormData() { return { name: document.getElementById('name').value, phone: document.getElementById('phone').value, email: '', propertyType: document.getElementById('propertyType').value, location: document.getElementById('location').value, budget: document.getElementById('budget').value, timeline: document.getElementById('timeline').value, message: '' }; }
function setFormError(messageText) { document.getElementById('form-error').textContent = messageText; }
function clearFormError() { setFormError(''); duplicateCandidate = null; renderDuplicateNotice(); }

async function loadDemoLead() {
  try {
    const rawLead = await leadSource.receiveLead(0);
    const demo = initializeLead(rawLead, activeConfig);
    demo.score = 94; demo.priority = 'HOT'; demo.status = 'Hot'; demo.reasons = scoreLead(demo, activeConfig).reasons;
    demo.conversation = demoConversation.map((entry) => message(entry.speaker, entry.text));
    addActivity(demo, 'lead_qualified', 'AI qualification completed', { status: 'qualified' });
    addActivity(demo, 'message_generated', 'AI reply generated', { provider: 'mock' });
    addActivity(demo, 'message_sent', 'Mock WhatsApp message sent', { provider: 'mock' });
    leads = [demo, ...leads.filter((lead) => lead.name !== demo.name)]; selectedLeadId = demo.id; activeLeadId = demo.id; humanActive = false; currentStage = 4; duplicateCandidate = null; trackEvent('demo_lead_loaded', { leadId: demo.id }); render();
  } catch (error) {
    setFormError('Lead source is temporarily unavailable. Continue manually.');
  }
}
function resetDemo() { leads = seedLeads(appModes.DEMO); selectedLeadId = leads[0].id; activeLeadId = selectedLeadId; humanActive = false; currentStage = 1; duplicateCandidate = null; document.getElementById('lead-form').reset(); clearFormError(); render(); }
function enableDemoMode() { appMode = appModes.DEMO; activeConfig = businessConfig; trackEvent('demo_started'); loadDemoLead(); document.getElementById('demo').scrollIntoView({ behavior: 'smooth' }); }
function takeover() { humanActive = true; currentStage = 4; const lead = getLead(activeLeadId || selectedLeadId); lead.humanActive = true; lead.conversation = [...lead.conversation, message('system', 'Human agent has taken over this conversation.')]; addActivity(lead, 'human_takeover', 'Human takeover', { automatedRecommendationsStopped: true }); trackEvent('human_takeover_clicked', { leadId: lead.id }); render(); }
function bookLead(id) { const lead = getLead(id); const previous = lead.status; lead.status = 'Booked'; currentStage = 5; addActivity(lead, 'status_changed', `Status changed from ${previous} to Booked`, { from: previous, to: 'Booked' }); addActivity(lead, 'appointment_booked', 'Appointment booked', {}); trackEvent('mark_booked_clicked', { leadId: lead.id }); render(); }
function openDuplicate(id) { selectedLeadId = id; activeLeadId = id; duplicateCandidate = null; render(); }
function createDuplicateInteraction(id) { const lead = getLead(id); addActivity(lead, 'lead_created', 'New interaction added to existing lead', { source: 'duplicate-detected' }); duplicateCandidate = null; selectedLeadId = id; activeLeadId = id; render(); }

function submitProspect(event) {
  event.preventDefault();
  const name = document.getElementById('prospect-name').value.trim();
  const business = document.getElementById('business-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  if (!name || !business || !email || !whatsapp) { document.getElementById('prospect-error').textContent = 'Please enter name, business, email, and phone/WhatsApp.'; return; }
  document.getElementById('prospect-error').textContent = '';
  const body = [`Name: ${name}`, `Business: ${business}`, `Email: ${email}`, `Phone/WhatsApp: ${whatsapp}`, `Agents: ${document.getElementById('agents').value}`, `Monthly leads: ${document.getElementById('monthly-leads').value}`, `Lead source: ${document.getElementById('lead-source').value}`, `Interest: ${document.getElementById('want').value}`].join('\n');
  trackEvent('contact_form_submitted', { interest: document.getElementById('want').value });
  window.location.href = `mailto:${contactDestination}?subject=CONVERTIQ%20Pilot%20Request&body=${encodeURIComponent(body)}`;
}

function bindEvents() {
  document.getElementById('lead-form').addEventListener('submit', submitLead);
  document.getElementById('prospect-form').addEventListener('submit', submitProspect);
  document.getElementById('demo-mode').addEventListener('click', enableDemoMode);
  document.getElementById('load-demo').addEventListener('click', loadDemoLead);
  document.getElementById('reset-demo').addEventListener('click', resetDemo);
  document.getElementById('takeover').addEventListener('click', takeover);
  document.getElementById('experience-demo').addEventListener('click', () => { trackEvent('demo_started'); setTimeout(loadDemoLead, 250); });
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('button, a'); if (!target) return;
    if (target.classList.contains('pilot-cta')) trackEvent('pilot_cta_clicked', { label: target.textContent.trim() });
    if (target.dataset.select) { selectedLeadId = target.dataset.select; if (getLead(selectedLeadId).priority === 'HOT') trackEvent('hot_lead_viewed', { leadId: selectedLeadId }); render(); }
    if (target.dataset.open) { activeLeadId = target.dataset.open; humanActive = getLead(activeLeadId).humanActive; currentStage = 4; render(); }
    if (target.dataset.book) bookLead(target.dataset.book);
    if (target.dataset.openDuplicate) openDuplicate(target.dataset.openDuplicate);
    if (target.dataset.createInteraction) createDuplicateInteraction(target.dataset.createInteraction);
    if (target.dataset.reply) { const lead = getLead(activeLeadId || selectedLeadId); lead.conversation = [...lead.conversation, message('lead', target.dataset.reply), message('system', target.dataset.reply === 'Yes, connect me' ? 'Agent alert created for immediate follow-up.' : 'Preference captured for agent follow-up.')]; addActivity(lead, 'message_sent', 'Lead quick reply captured', { reply: target.dataset.reply }); currentStage = target.dataset.reply === 'Yes, connect me' ? 4 : 3; render(); }
  });
}

resetDemo(); bindEvents();
