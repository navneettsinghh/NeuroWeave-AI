import { businessConfig } from './config/business.example.js';

const DEFAULT_STATUS = 'New';
const DEFAULT_PRIORITY = 'COLD';

export function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizePhone(phone = '') {
  return String(phone).replace(/[^0-9+]/g, '').replace(/^00/, '+');
}

export function normalizeLead(rawLead = {}, config = businessConfig) {
  const timestamp = rawLead.createdAt || nowIso();
  const lead = {
    id: rawLead.id || createId('lead'),
    name: String(rawLead.name || '').trim(),
    phone: normalizePhone(rawLead.phone || ''),
    email: String(rawLead.email || '').trim().toLowerCase(),
    source: rawLead.source || 'manual-demo',
    message: String(rawLead.message || '').trim(),
    propertyType: rawLead.propertyType || config.propertyTypes?.[0] || 'Other',
    location: String(rawLead.location || '').trim(),
    budget: rawLead.budget || 'Not sure yet',
    timeline: rawLead.timeline || 'Just researching',
    status: rawLead.status || DEFAULT_STATUS,
    priority: rawLead.priority || DEFAULT_PRIORITY,
    score: Number(rawLead.score || 0),
    intent: rawLead.intent || 'Unqualified',
    conversation: rawLead.conversation || [],
    activities: rawLead.activities || [],
    aiSummary: rawLead.aiSummary || '',
    nextAction: rawLead.nextAction || 'Review this lead manually.',
    reasons: rawLead.reasons || [],
    humanActive: Boolean(rawLead.humanActive),
    lastActivityAt: rawLead.lastActivityAt || timestamp,
    createdAt: timestamp,
    updatedAt: rawLead.updatedAt || timestamp
  };
  const validation = validateLead(lead);
  if (!validation.valid) {
    const error = new Error(validation.errors.join('; '));
    error.code = 'INVALID_LEAD';
    error.errors = validation.errors;
    throw error;
  }
  return lead;
}

export function validateLead(lead) {
  const errors = [];
  if (!lead.name) errors.push('Lead name is required');
  if (!lead.phone) errors.push('Lead phone is required');
  return { valid: errors.length === 0, errors };
}

export function detectDuplicateLead(candidate, existingLeads = []) {
  const phone = normalizePhone(candidate.phone);
  const email = String(candidate.email || '').trim().toLowerCase();
  return existingLeads.find((lead) => {
    const existingPhone = normalizePhone(lead.phone);
    const phoneMatch = existingPhone === phone || (phone.length >= 10 && existingPhone.endsWith(phone.slice(-10)));
    return phoneMatch || (email && String(lead.email || '').toLowerCase() === email);
  }) || null;
}

export class MockLeadSource {
  constructor(rawLeads = [], config = businessConfig) {
    this.rawLeads = rawLeads;
    this.config = config;
  }
  async receiveLead(index = 0) {
    const rawLead = this.rawLeads[index];
    if (!rawLead) {
      const error = new Error('No mock lead available');
      error.code = 'LEAD_SOURCE_FAILURE';
      throw error;
    }
    return rawLead;
  }
  normalizeLead(rawLead) {
    return normalizeLead(rawLead, this.config);
  }
}

export function createActivityEvent(type, leadId, description, metadata = {}) {
  return { type, timestamp: nowIso(), leadId, description, metadata };
}

export function addActivity(lead, type, description, metadata = {}) {
  const event = createActivityEvent(type, lead.id, description, metadata);
  lead.activities = [...(lead.activities || []), event];
  lead.lastActivityAt = event.timestamp;
  lead.updatedAt = event.timestamp;
  return event;
}

export function scoreLead(lead, config = businessConfig) {
  const rules = config.scoringRules || businessConfig.scoringRules;
  let score = 20;
  const reasons = [];
  const timelineWeight = rules.timelineWeights?.[lead.timeline] ?? 0;
  score += timelineWeight;
  if (timelineWeight >= 20) reasons.push('Purchase timeline under 30 days');
  else if (timelineWeight > 0) reasons.push('Defined purchase timeline');
  else reasons.push('Early-stage research timeline');
  if (lead.budget && lead.budget !== 'Not sure yet') { score += 18; reasons.push('Specific budget'); }
  if (lead.location && lead.location.length > 2) { score += 18; reasons.push('Preferred location identified'); }
  if (lead.propertyType && lead.propertyType !== 'Other') { score += 14; reasons.push('Clear property type'); }
  if (lead.message || lead.conversation?.length >= 4) { score += 8; reasons.push('High conversation engagement'); }
  const normalized = Math.max(0, Math.min(100, score));
  const priority = normalized >= (rules.hotThreshold || 75) ? 'HOT' : normalized >= (rules.warmThreshold || 45) ? 'WARM' : 'COLD';
  return { score: normalized, priority, reasons };
}

export function isWithinWorkingHours(date = new Date(), config = businessConfig) {
  const [startHour, startMinute] = config.workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = config.workingHours.end.split(':').map(Number);
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= startHour * 60 + startMinute && minutes <= endHour * 60 + endMinute;
}

export function evaluateFollowUpPolicy(lead, config = businessConfig, currentTime = new Date()) {
  if (lead.humanActive) return { shouldFollowUp: false, recommendedAction: 'Human agent is handling this conversation.', reason: 'Human takeover active', urgency: 'none' };
  if (!isWithinWorkingHours(currentTime, config)) return { shouldFollowUp: true, recommendedAction: 'Schedule follow-up for the next business period.', reason: 'Outside working hours', urgency: 'scheduled' };
  if (lead.priority === 'HOT') return { shouldFollowUp: true, recommendedAction: 'Contact this lead immediately.', reason: 'HOT lead with no active human owner', urgency: 'high' };
  const inactiveHours = Math.max(0, (currentTime - new Date(lead.lastActivityAt || lead.updatedAt)) / 36e5);
  if (lead.priority === 'WARM' && inactiveHours >= (config.followUpPolicy.warmLeadInactiveHours || 24)) return { shouldFollowUp: true, recommendedAction: 'Follow up with the lead.', reason: 'WARM lead inactive beyond policy', urgency: 'medium' };
  if (lead.priority === 'COLD' && inactiveHours >= (config.followUpPolicy.coldLeadInactiveHours || 72)) return { shouldFollowUp: true, recommendedAction: 'Send a low-pressure check-in after human review.', reason: 'COLD lead inactive beyond policy', urgency: 'low' };
  return { shouldFollowUp: false, recommendedAction: 'No follow-up required yet.', reason: 'Within follow-up policy', urgency: 'none' };
}

export class MockRealEstateQualificationProvider {
  constructor(options = {}) {
    this.available = options.available !== false;
  }
  async qualifyLead(lead, conversation = [], config = businessConfig) {
    if (!this.available) throw new Error('AI provider unavailable');
    const scoring = scoreLead(lead, config);
    return {
      qualification_status: conversation.length >= 3 ? 'qualified' : 'incomplete',
      lead_score: scoring.score,
      priority: scoring.priority,
      reasons: scoring.reasons,
      intent: scoring.priority === 'HOT' ? 'High purchase intent' : scoring.priority === 'WARM' ? 'Active comparison' : 'Early research',
      budget: lead.budget,
      location: lead.location,
      property_type: lead.propertyType,
      timeline: lead.timeline
    };
  }
  async generateReply(lead, _conversation = [], config = businessConfig) {
    if (!this.available) throw new Error('AI provider unavailable');
    const firstName = lead.name.split(' ')[0];
    const questions = config.qualificationQuestions.map((question) => typeof question === 'string' ? question : question.label).join(', ');
    return `Hi ${firstName} 👋 Thanks for reaching out to ${config.businessName}. I’ll quickly confirm ${questions.toLowerCase()} so an agent can help you with the right options.`;
  }
  async summarizeLead(lead) {
    if (!this.available) throw new Error('AI provider unavailable');
    return `${lead.priority}-priority buyer looking for ${lead.propertyType.toLowerCase()} in ${lead.location || 'their preferred area'} with a ${lead.budget} budget. Purchase timeline: ${lead.timeline}.`;
  }
  async recommendNextAction(lead, config = businessConfig) {
    if (!this.available) throw new Error('AI provider unavailable');
    const policy = evaluateFollowUpPolicy(lead, config);
    return policy.recommendedAction;
  }
}

export class MockWhatsAppProvider {
  constructor(options = {}) {
    this.available = options.available !== false;
  }
  async sendMessage(to, message) {
    if (!this.available) throw new Error('WhatsApp provider unavailable');
    if (!to || !message) throw new Error('Message failure: recipient and message are required');
    return { ok: true, providerMessageId: `mock_${Date.now()}` };
  }
  async sendTemplate(to, templateName, variables) {
    return this.sendMessage(to, `${templateName}: ${JSON.stringify(variables)}`);
  }
  async receiveMessage(payload) {
    if (!this.available) throw new Error('WhatsApp provider unavailable');
    return { id: createId('msg'), speaker: 'lead', text: typeof payload === 'string' ? payload : 'Demo reply received.', createdAt: nowIso() };
  }
}
