"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, BookmarkCheck, Clock, ArrowRight, Zap, Wallet, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";

interface Profile {
  name: string;
  plan: string;
  plan_expires_at: string | null;
  searches_used: number;
  searches_limit: number;
  saved_leads: number;
  wallet_balance: number;
}

interface RecentSearch {
  id: string;
  query: string;
  location: string;
  industry: string;
  result_count: number;
  searched_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [listsCount, setListsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const [{ data: p }, { data: searches }, { count: lCount }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("searches")
          .select("*")
          .eq("user_id", user.id)
          .order("searched_at", { ascending: false })
          .limit(4),
        supabase
          .from("lead_lists")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setProfile(p);
      setRecentSearches(searches ?? []);
      setListsCount(lCount ?? 0);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-56" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const used = profile?.searches_used ?? 0;
  const limit = profile?.searches_limit ?? 10;
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;

  const statCards = [
    {
      label: "Searches This Month",
      value: `${used} / ${limit}`,
      sub: `${pct}% of monthly limit`,
      icon: Search,
      color: "text-blue-600",
      bg: "bg-blue-50",
      bar: pct,
      barColor: "bg-blue-500",
    },
    {
      label: "Saved Leads",
      value: String(profile?.saved_leads ?? 0),
      sub: "Across all lists",
      icon: BookmarkCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      bar: null,
      barColor: "",
    },
    {
      label: "Lead Lists",
      value: String(listsCount),
      sub: "Active collections",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      bar: null,
      barColor: "",
    },
    {
      label: "Recent Searches",
      value: String(recentSearches.length),
      sub: "Saved for quick re-run",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      bar: null,
      barColor: "",
    },
  ];

  const planInfo = PLAN_CONFIG[(profile?.plan ?? "free") as PlanKey];

  const planExpiry = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;
  const planExpired = planExpiry && profile?.plan !== "free" ? planExpiry < new Date() : false;
  const planExpiringSoon = planExpiry && profile?.plan !== "free" && !planExpired
    ? (planExpiry.getTime() - Date.now()) < 5 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {(profile?.name ?? "there").split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your leads today.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Plan badge */}
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${planInfo.badge}`}>
            {planInfo.label} Plan
          </span>
          {/* Wallet balance */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <Wallet size={14} className="text-green-500" />
            <span className="text-sm font-semibold text-gray-800">
              ${Number(profile?.wallet_balance ?? 0).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">wallet</span>
          </div>
          {/* Upgrade CTA for free plan */}
          {profile?.plan === "free" && (
            <Link
              href="/billing"
              className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              ↑ Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Plan expiry banner */}
      {planExpired && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">Your {planInfo.label} plan has expired.</p>
            <p className="text-red-600 text-xs mt-0.5">Renew now to regain access to all features.</p>
          </div>
          <Link href="/billing" className="text-xs font-semibold bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap">
            Renew Plan
          </Link>
        </div>
      )}
      {planExpiringSoon && !planExpired && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 text-sm">Your {planInfo.label} plan expires soon.</p>
            <p className="text-yellow-600 text-xs mt-0.5">
              Expires on {planExpiry?.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}.
            </p>
          </div>
          <Link href="/billing" className="text-xs font-semibold bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors whitespace-nowrap">
            Renew Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              {card.bar !== null && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${card.barColor} rounded-full transition-all`}
                      style={{ width: `${card.bar}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Search */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Quick Search</h2>
            <Zap size={16} className="text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Find leads by role, company, or industry instantly.</p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="e.g. SaaS Founders in New York"
              className="flex-1 min-w-0 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value;
                  router.push(`/search?q=${encodeURIComponent(q)}`);
                }
              }}
            />
            <Link
              href="/search"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              Search <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["CEO in SaaS", "HR Managers", "Marketing Directors", "Startup Founders"].map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Plan Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Your Plan</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full capitalize">
              {profile?.plan ?? "free"}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Searches/month</span>
              <span className="font-medium text-gray-800">{limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Used this month</span>
              <span className="font-medium text-gray-800">{used}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Saved leads</span>
              <span className="font-medium text-gray-800">{profile?.saved_leads ?? 0}</span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="mt-5 block w-full text-center bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan →
          </Link>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" /> Recent Searches
          </h2>
          <Link href="/searches" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {recentSearches.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No searches yet. Run your first search!</p>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Search size={13} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{s.query}</div>
                    <div className="text-xs text-gray-400">
                      {[s.location, s.industry].filter(Boolean).join(" · ")}
                      {s.result_count != null ? ` · ${s.result_count} results` : ""}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(s.query)}&location=${encodeURIComponent(s.location ?? "")}`}
                  className="text-xs text-blue-600 font-medium hover:underline shrink-0"
                >
                  Re-run
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const used = mockUser.searchesUsed;
const limit = mockUser.searchesLimit;
const pct = Math.round((used / limit) * 100);

const statCards = [
  {
    label: "Searches This Month",
    value: `${used} / ${limit}`,
    sub: `${pct}% of monthly limit`,
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
    bar: pct,
    barColor: "bg-blue-500",
  },
  {
    label: "Saved Leads",
    value: mockUser.savedLeads.toString(),
    sub: "Across all lists",
    icon: BookmarkCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    bar: null,
    barColor: "",
  },
  {
    label: "Lead Lists",
    value: mockLists.length.toString(),
    sub: "Active collections",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
    bar: null,
    barColor: "",
  },
  {
    label: "Recent Searches",
    value: mockRecentSearches.length.toString(),
    sub: "Saved for quick re-run",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50",
    bar: null,
    barColor: "",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {mockUser.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your leads today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              {card.bar !== null && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${card.barColor} rounded-full transition-all`}
                      style={{ width: `${card.bar}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Search */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Quick Search</h2>
            <Zap size={16} className="text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Find leads by role, company, or industry instantly.</p>
      <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="e.g. SaaS Founders in New York"
              className="flex-1 min-w-0 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Link
              href="/search"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
            >
              Search <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["CEO in SaaS", "HR Managers", "Marketing Directors", "Startup Founders"].map((q) => (
              <Link
                key={q}
                href={`/search?q=${encodeURIComponent(q)}`}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Plan Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Your Plan</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full capitalize">
              {mockUser.plan}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Searches/month</span>
              <span className="font-medium text-gray-800">{limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Leads export</span>
              <span className="font-medium text-gray-800">Up to 500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Team seats</span>
              <span className="font-medium text-gray-800">1</span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="mt-5 block w-full text-center bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" /> Recent Searches
          </h2>
          <Link href="/searches" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {mockRecentSearches.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Search size={13} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{s.query}</div>
                  <div className="text-xs text-gray-400">
                    {s.location} · {s.industry} · {s.resultCount} results
                  </div>
                </div>
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(s.query)}&location=${encodeURIComponent(s.location)}`}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Re-run
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
