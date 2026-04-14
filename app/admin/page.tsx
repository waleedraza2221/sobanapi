"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";

interface UserProfile {
  id: string;
  plan: PlanKey;
  plan_expires_at: string | null;
  wallet_balance: number;
  created_at: string;
  role: string;
}

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/payments").then((r) => r.json()),
    ]).then(([ud, pd]) => {
      setUsers(ud.users ?? []);
      setPayments(pd.payments ?? []);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);

  const totalUsers = users.length;
  const newThisMonth = users.filter((u) => u.created_at?.startsWith(thisMonth)).length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const expiredCount = users.filter(
    (u) => u.plan_expires_at && u.plan !== "free" && new Date(u.plan_expires_at) < now
  ).length;

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const approvedThisMonth = payments.filter(
    (p) => p.status === "approved" && p.submitted_at?.startsWith(thisMonth)
  );
  const monthRevenue = approvedThisMonth.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const totalRevenue = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const planCounts = Object.keys(PLAN_CONFIG).reduce((acc, key) => {
    acc[key] = users.filter((u) => u.plan === key).length;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      label: "Total Users",
      value: loading ? "—" : totalUsers,
      sub: `+${newThisMonth} this month`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Payments",
      value: loading ? "—" : pendingPayments.length,
      sub: "Awaiting review",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/admin/payments",
    },
    {
      label: "Revenue This Month",
      value: loading ? "—" : `$${monthRevenue}`,
      sub: `$${totalRevenue} all time`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Expired Plans",
      value: loading ? "—" : expiredCount,
      sub: "Need renewal",
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
      href: "/admin/users",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Admin dashboard ·{" "}
          {now.toLocaleDateString("en-US", { dateStyle: "long" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-200 transition-colors"
            >
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </Link>
          ) : (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`inline-flex p-2 rounded-xl ${bg} mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Plan Distribution</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(Object.entries(PLAN_CONFIG) as [PlanKey, (typeof PLAN_CONFIG)[PlanKey]][]).map(
                ([key, cfg]) => {
                  const count = planCounts[key] ?? 0;
                  const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-gray-500">
                          {count} users{" "}
                          <span className="text-gray-300">·</span> {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  Manage Users
                </p>
                <p className="text-xs text-gray-400">Edit roles, plans, wallet balances</p>
              </div>
              <span className="text-xs font-semibold text-gray-400">{totalUsers}</span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="bg-yellow-50 p-2 rounded-lg">
                <CreditCard size={16} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  Review Payments
                </p>
                <p className="text-xs text-gray-400">Approve or reject pending payments</p>
              </div>
              {pendingPayments.length > 0 && (
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {pendingPayments.length}
                </span>
              )}
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle size={12} className="text-green-500" />
              <span>{totalUsers - expiredCount} active / non-expired users</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle size={12} className="text-blue-400" />
              <span>{adminCount} admin account{adminCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
