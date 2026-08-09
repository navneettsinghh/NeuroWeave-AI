export const businessConfig = {
  businessName: 'Example Realty',
  businessType: 'real-estate',
  description: 'Pilot-safe placeholder configuration for a real-estate sales team.',
  locations: ['City Center', 'Powai', 'Whitefield', 'BKC', 'Sarjapur Road'],
  propertyTypes: ['3 BHK Apartment', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Other'],
  workingHours: {
    start: '09:00',
    end: '19:00'
  },
  contact: {
    phone: '+91 00000 00000',
    email: 'sales@example.com'
  },
  qualificationQuestions: [
    { key: 'propertyType', label: 'Property type' },
    { key: 'location', label: 'Preferred location' },
    { key: 'budget', label: 'Budget' },
    { key: 'timeline', label: 'Purchase timeline' }
  ],
  aiTone: 'professional',
  leadSources: ['demo-form', 'mock-whatsapp'],
  followUpPolicy: {
    hotLeadMinutes: 5,
    warmLeadInactiveHours: 24,
    coldLeadInactiveHours: 72,
    requireHumanApproval: true
  },
  scoringRules: {
    hotThreshold: 75,
    warmThreshold: 45,
    timelineWeights: {
      Immediately: 25,
      'Within 30 days': 24,
      'Within 1 month': 22,
      '1–3 months': 12,
      '3–6 months': 6,
      'Just researching': -10
    }
  }
};

export function validateBusinessConfig(config) {
  const required = ['businessName', 'businessType', 'workingHours', 'contact', 'qualificationQuestions', 'followUpPolicy'];
  const missing = required.filter((key) => !config || config[key] === undefined || config[key] === null);
  if (missing.length) return { valid: false, errors: missing.map((key) => `Missing ${key}`) };
  if (!config.contact.email || !config.contact.phone) return { valid: false, errors: ['Missing contact email or phone'] };
  if (!Array.isArray(config.qualificationQuestions) || config.qualificationQuestions.length === 0) return { valid: false, errors: ['At least one qualification question is required'] };
  return { valid: true, errors: [] };
}
