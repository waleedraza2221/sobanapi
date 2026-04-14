export type Plan = "free" | "starter" | "pro" | "enterprise";

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  linkedinUrl: string;
  email?: string;
  phone?: string;
  companySize?: string;
  experience?: string;
  savedAt?: string;
  lists?: string[];
}

export const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    searches: 10,
    savedLeads: 50,
    lists: 2,
    features: ["10 searches/month", "Save up to 50 leads", "2 lead lists", "Basic filters", "CSV export"],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    searches: 100,
    savedLeads: 500,
    lists: 10,
    features: ["100 searches/month", "Save up to 500 leads", "10 lead lists", "Advanced filters", "CSV export", "Email support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    searches: 500,
    savedLeads: -1,
    lists: -1,
    features: ["500 searches/month", "Unlimited saved leads", "Unlimited lists", "All filters + remote", "CSV & CRM export", "Priority support", "Saved search alerts"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: -1,
    searches: -1,
    savedLeads: -1,
    lists: -1,
    features: ["Custom search volume", "Unlimited everything", "Team workspaces", "API access", "Webhooks", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    highlight: false,
  },
];
