"use client";
import Link from "next/link";
import { mockUser, mockLeads, mockLists, mockRecentSearches } from "@/lib/mock-data";
import { Search, Users, BookmarkCheck, Clock, TrendingUp, ArrowRight, Zap } from "lucide-react";

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
    <div className="p-8 max-w-6xl mx-auto">
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
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. SaaS Founders in New York"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Link
              href="/search"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
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
