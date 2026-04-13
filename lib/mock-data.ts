export type Plan = "free" | "starter" | "pro" | "enterprise";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  searchesUsed: number;
  searchesLimit: number;
  savedLeads: number;
  joinedAt: string;
}

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

export interface LeadList {
  id: string;
  name: string;
  leadCount: number;
  createdAt: string;
  description?: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  location: string;
  industry: string;
  resultCount: number;
  searchedAt: string;
  filters: {
    jobType?: string;
    experienceLevel?: string;
    remote?: boolean;
  };
}

export const mockUser: User = {
  id: "user_1",
  name: "Alex Johnson",
  email: "alex@company.com",
  plan: "pro",
  searchesUsed: 47,
  searchesLimit: 500,
  savedLeads: 214,
  joinedAt: "2025-11-01",
};

export const mockLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Sarah Mitchell",
    title: "Head of E-Commerce",
    company: "Shopify Plus Agency",
    location: "New York, NY",
    industry: "E-Commerce",
    linkedinUrl: "https://linkedin.com/in/sarah-mitchell",
    email: "sarah@shopifyagency.com",
    companySize: "51-200",
    experience: "senior",
    savedAt: "2026-04-10",
    lists: ["list_1"],
  },
  {
    id: "lead_2",
    name: "James Rodriguez",
    title: "Director of Digital Marketing",
    company: "GrowthLab Inc.",
    location: "Austin, TX",
    industry: "SaaS",
    linkedinUrl: "https://linkedin.com/in/james-rodriguez",
    email: "james@growthlab.io",
    companySize: "11-50",
    experience: "director",
    savedAt: "2026-04-09",
    lists: ["list_1", "list_2"],
  },
  {
    id: "lead_3",
    name: "Priya Sharma",
    title: "VP of Sales",
    company: "CloudOps Technologies",
    location: "San Francisco, CA",
    industry: "SaaS",
    linkedinUrl: "https://linkedin.com/in/priya-sharma",
    companySize: "201-500",
    experience: "senior",
    savedAt: "2026-04-08",
    lists: ["list_2"],
  },
  {
    id: "lead_4",
    name: "Michael Chen",
    title: "E-Commerce Manager",
    company: "RetailBoost",
    location: "Chicago, IL",
    industry: "E-Commerce",
    linkedinUrl: "https://linkedin.com/in/michael-chen",
    email: "mchen@retailboost.com",
    companySize: "11-50",
    experience: "mid",
    savedAt: "2026-04-07",
    lists: [],
  },
  {
    id: "lead_5",
    name: "Emily Watson",
    title: "Chief Marketing Officer",
    company: "Brandify",
    location: "Los Angeles, CA",
    industry: "Marketing",
    linkedinUrl: "https://linkedin.com/in/emily-watson",
    companySize: "51-200",
    experience: "executive",
    savedAt: "2026-04-06",
    lists: ["list_3"],
  },
  {
    id: "lead_6",
    name: "David Park",
    title: "Founder & CEO",
    company: "StartupFlow",
    location: "Seattle, WA",
    industry: "SaaS",
    linkedinUrl: "https://linkedin.com/in/david-park",
    email: "david@startupflow.io",
    companySize: "1-10",
    experience: "executive",
    savedAt: "2026-04-05",
    lists: ["list_1"],
  },
  {
    id: "lead_7",
    name: "Laura Nguyen",
    title: "Digital Strategy Lead",
    company: "Pixel & Co.",
    location: "Miami, FL",
    industry: "Marketing",
    linkedinUrl: "https://linkedin.com/in/laura-nguyen",
    companySize: "1-10",
    experience: "mid",
    savedAt: "2026-04-04",
    lists: [],
  },
  {
    id: "lead_8",
    name: "Tom Harris",
    title: "Head of Partnerships",
    company: "NexaConnect",
    location: "Boston, MA",
    industry: "B2B",
    linkedinUrl: "https://linkedin.com/in/tom-harris",
    email: "t.harris@nexaconnect.com",
    companySize: "51-200",
    experience: "director",
    savedAt: "2026-04-03",
    lists: ["list_2"],
  },
];

export const mockLists: LeadList[] = [
  {
    id: "list_1",
    name: "NYC E-Commerce Decision Makers",
    leadCount: 34,
    createdAt: "2026-03-15",
    description: "Senior buyers in NYC e-commerce space",
  },
  {
    id: "list_2",
    name: "SaaS CTOs & VPs",
    leadCount: 89,
    createdAt: "2026-03-22",
    description: "Tech leaders in SaaS companies",
  },
  {
    id: "list_3",
    name: "Marketing Directors - West Coast",
    leadCount: 21,
    createdAt: "2026-04-01",
    description: "CMOs and Marketing Directors in CA, WA, OR",
  },
  {
    id: "list_4",
    name: "Hot Leads Q2 2026",
    leadCount: 12,
    createdAt: "2026-04-10",
    description: "High-priority leads for Q2 outreach",
  },
];

export const mockRecentSearches: RecentSearch[] = [
  {
    id: "search_1",
    query: "E-Commerce Manager",
    location: "New York",
    industry: "E-Commerce",
    resultCount: 47,
    searchedAt: "2026-04-14T10:32:00Z",
    filters: { jobType: "full-time", experienceLevel: "mid" },
  },
  {
    id: "search_2",
    query: "VP of Sales",
    location: "San Francisco",
    industry: "SaaS",
    resultCount: 23,
    searchedAt: "2026-04-13T15:45:00Z",
    filters: { experienceLevel: "senior", remote: false },
  },
  {
    id: "search_3",
    query: "Digital Marketing Director",
    location: "Austin",
    industry: "Marketing",
    resultCount: 31,
    searchedAt: "2026-04-12T09:10:00Z",
    filters: { remote: true },
  },
  {
    id: "search_4",
    query: "Head of Growth",
    location: "Chicago",
    industry: "SaaS",
    resultCount: 18,
    searchedAt: "2026-04-11T14:22:00Z",
    filters: { jobType: "full-time", experienceLevel: "director" },
  },
  {
    id: "search_5",
    query: "E-Commerce Director",
    location: "Los Angeles",
    industry: "E-Commerce",
    resultCount: 56,
    searchedAt: "2026-04-10T11:05:00Z",
    filters: { experienceLevel: "director" },
  },
];

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
