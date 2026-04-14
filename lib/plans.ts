export const PLAN_CONFIG = {
  free: {
    label: "Free",
    price: 0,
    searches: 5,
    canSave: false,
    hasHistory: false,
    color: "text-gray-600",
    badge: "bg-gray-100 text-gray-600",
    description: "Get started for free",
    features: [
      "5 searches / month",
      "LinkedIn profile results",
      "Basic contact info",
    ],
    restrictions: [
      "No contact saving",
      "No search history",
    ],
    cta: "Get Started",
    highlight: false,
  },
  starter: {
    label: "Starter",
    price: 10,
    searches: 20,
    canSave: true,
    hasHistory: true,
    color: "text-blue-600",
    badge: "bg-blue-100 text-blue-600",
    description: "For individuals prospecting",
    features: [
      "20 searches / month",
      "Save & export contacts",
      "Full search history",
      "Lead lists & collections",
      "Email & phone data",
    ],
    restrictions: [],
    cta: "Start for $10 / mo",
    highlight: false,
  },
  pro: {
    label: "Pro",
    price: 30,
    searches: 100,
    canSave: true,
    hasHistory: true,
    color: "text-purple-600",
    badge: "bg-purple-100 text-purple-600",
    description: "For growing sales teams",
    features: [
      "100 searches / month",
      "Save & export contacts",
      "Full search history",
      "Lead lists & collections",
      "Email & phone data",
      "Priority support",
      "Advanced filters",
    ],
    restrictions: [],
    cta: "Start for $30 / mo",
    highlight: true,
  },
  enterprise: {
    label: "Enterprise",
    price: -1,
    searches: 500,
    canSave: true,
    hasHistory: true,
    color: "text-orange-600",
    badge: "bg-orange-100 text-orange-600",
    description: "For large teams & agencies",
    features: [
      "500 searches / month",
      "Save & export contacts",
      "Full search history",
      "Lead lists & collections",
      "Email & phone data",
      "Priority support",
      "Advanced filters",
      "Admin panel access",
      "Wallet balance system",
      "Custom search limits",
    ],
    restrictions: [],
    cta: "Contact Sales",
    highlight: false,
  },
} as const;

export type PlanKey = keyof typeof PLAN_CONFIG;

/** Returns the plan-based search limit */
export function getPlanLimit(plan: string): number {
  return PLAN_CONFIG[plan as PlanKey]?.searches ?? 5;
}

/** Returns true if the plan allows saving contacts */
export function canPlanSave(plan: string): boolean {
  return PLAN_CONFIG[plan as PlanKey]?.canSave ?? false;
}

/** Returns true if the plan has search history */
export function planHasHistory(plan: string): boolean {
  return PLAN_CONFIG[plan as PlanKey]?.hasHistory ?? false;
}
