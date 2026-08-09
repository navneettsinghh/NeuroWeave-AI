import { businessConfig } from './config/business.example.js';

export const appModes = {
  DEMO: 'DEMO',
  PILOT: 'PILOT'
};

export const demoRawLeads = [
  {
    name: 'Rahul Sharma',
    phone: '+91 98765 11111',
    email: 'rahul.demo@example.com',
    source: 'mock-whatsapp',
    message: "Hi, I'm interested in a 3 BHK apartment.",
    propertyType: '3 BHK Apartment',
    location: 'City Center',
    budget: '₹80 Lakh',
    timeline: 'Within 30 days',
    status: 'Hot'
  },
  {
    name: 'Priya Mehta',
    phone: '+91 91234 56789',
    email: 'priya.demo@example.com',
    source: 'website-form',
    message: 'Looking for apartments near Powai.',
    propertyType: 'Apartment',
    location: 'Powai',
    budget: '₹80L–₹1Cr',
    timeline: '3–6 months',
    status: 'Contacted'
  },
  {
    name: 'Aman Singh',
    phone: '+91 99887 76655',
    email: 'aman.demo@example.com',
    source: 'property-portal',
    message: 'Need a villa viewing this week.',
    propertyType: 'Villa',
    location: 'Whitefield',
    budget: '₹1Cr–₹1.5Cr',
    timeline: 'Within 1 month',
    status: 'Booked'
  },
  {
    name: 'Rohan Iyer',
    phone: '+91 90000 11122',
    email: 'rohan.demo@example.com',
    source: 'walk-in-list',
    message: 'Exploring plot options.',
    propertyType: 'Plot',
    location: 'Sarjapur Road',
    budget: '₹60L–₹80L',
    timeline: 'Just researching',
    status: 'New'
  }
];

export const demoConversation = [
  { speaker: 'lead', text: "Hi, I'm interested in a 3 BHK apartment." },
  { speaker: 'ai', text: "Hi Rahul 👋 Thanks for reaching out. I'd be happy to help you find the right property. What location are you looking for?" },
  { speaker: 'lead', text: 'Near the city center.' },
  { speaker: 'ai', text: "Great. What's your approximate budget?" },
  { speaker: 'lead', text: 'Around ₹80 lakh.' },
  { speaker: 'ai', text: 'Perfect. Are you looking to purchase immediately or within the next few months?' },
  { speaker: 'lead', text: 'Probably within 30 days.' },
  { speaker: 'ai', text: 'Thanks! You look like a high-intent buyer. Would you like an agent to share matching properties with you?' }
];

export const demoCommandCenter = {
  metrics: {
    'Needs Attention': '3 Hot Leads',
    'At Risk': '2 Leads',
    'Follow-Up Due': '4 Leads',
    Appointments: '5 Today'
  },
  recommendations: [
    '🔥 Contact Rahul Sharma now.',
    '⚠️ Follow up with Priya Mehta.',
    "📅 Confirm Aman Singh's property viewing."
  ]
};

export const pilotCommandCenter = {
  metrics: {
    'Needs Attention': '0 Hot Leads',
    'At Risk': '0 Leads',
    'Follow-Up Due': '0 Leads',
    Appointments: '0 Today'
  },
  recommendations: [
    'Add your first client lead source.',
    'Configure approved WhatsApp provider before launch.',
    'Run one test lead before pilot handoff.'
  ]
};

export const demoEnvironment = {
  mode: appModes.DEMO,
  businessConfig,
  commandCenter: demoCommandCenter
};
