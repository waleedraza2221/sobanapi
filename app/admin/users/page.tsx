"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  Wallet,
  Search,
  X,
  Plus,
  Minus,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";

const ROLES = ["user", "admin"] as const;
const PLAN_KEYS = Object.keys(PLAN_CONFIG) as PlanKey[];

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: PlanKey;
  plan_expires_at: string | null;
  searches_used: number;
  searches_limit: number;
  wallet_balance: number;
  created_at: string;
}

interface WalletModal {
  userId: string;
  name: string;
  current: number;
}

function isPlanExpired(expiresAt: string | null, plan: string) {
  if (!expiresAt || plan === "free") return false;
  return new Date(expiresAt) < new Date();
}

function isPlanExpiringSoon(expiresAt: string | null, plan: string) {
  if (!expiresAt || plan === "free") return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000;
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  return (
    <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
      <div
        className={`h-full rounded-full ${
          pct > 80 ? "bg-red-400" : pct > 50 ? "bg-yellow-400" : "bg-green-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [walletModal, setWalletModal] = useState<WalletModal | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletMode, setWalletMode] = useState<"add" | "set">("add");
  const [walletLoading, setWalletLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setLoading(false);
      });
  }, []);

  async function updateUser(
    userId: string,
    field: "role" | "plan" | "searches_limit",
    value: string | number
  ) {
    setSaving(userId + field);
    const body: Record<string, string | number> = { userId };
    body[field] = value;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const updated = { ...u, [field]: value };
          if (field === "plan") {
            updated.searches_limit =
              data.searches_limit ??
              PLAN_CONFIG[value as PlanKey]?.searches ??
              u.searches_limit;
          }
          return updated;
        })
      );
    }
    setSaving(null);
  }

  async function submitWallet() {
    if (!walletModal) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount < 0) return;
    setWalletLoading(true);
    const res = await fetch("/api/admin/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: walletModal.userId, amount, mode: walletMode }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === walletModal.userId ? { ...u, wallet_balance: data.wallet_balance } : u
        )
      );
      setWalletModal(null);
      setWalletAmount("");
    }
    setWalletLoading(false);
  }

  const expiredCount = users.filter((u) => isPlanExpired(u.plan_expires_at, u.plan)).length;
  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {users.length} total
            {expiredCount > 0 && (
              <span className="text-red-500 font-medium ml-1">
                · {expiredCount} expired plan{expiredCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Plan</th>
                  <th className="px-5 py-3 text-left">Plan Expiry</th>
                  <th className="px-5 py-3 text-left">Searches / Limit</th>
                  <th className="px-5 py-3 text-left">Wallet</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => {
                  const expired = isPlanExpired(u.plan_expires_at, u.plan);
                  const expiring = isPlanExpiringSoon(u.plan_expires_at, u.plan);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-gray-50 transition-colors ${expired ? "bg-red-50/30" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                            {(u.name ?? u.email)[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                          {u.role === "admin" && (
                            <Shield size={13} className="text-red-400 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          disabled={saving === u.id + "role"}
                          onChange={(e) => updateUser(u.id, "role", e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.plan}
                          disabled={saving === u.id + "plan"}
                          onChange={(e) => updateUser(u.id, "plan", e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {PLAN_KEYS.map((p) => (
                            <option key={p} value={p}>
                              {PLAN_CONFIG[p].label}
                              {PLAN_CONFIG[p].price > 0 ? ` ($${PLAN_CONFIG[p].price}/mo)` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {u.plan === "free" ? (
                          <span className="text-xs text-gray-400">No expiry</span>
                        ) : u.plan_expires_at ? (
                          <div className="flex items-center gap-1.5">
                            {expired ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle size={10} /> EXPIRED
                              </span>
                            ) : expiring ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                                <Clock size={10} /> Soon
                              </span>
                            ) : (
                              <Check size={12} className="text-green-500" />
                            )}
                            <span className="text-xs text-gray-400">
                              {u.plan_expires_at.split("T")[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <UsageBar used={u.searches_used} limit={u.searches_limit} />
                          <span className="text-xs text-gray-600">{u.searches_used}</span>
                          <span className="text-xs text-gray-400">/</span>
                          <input
                            type="number"
                            min={1}
                            value={u.searches_limit}
                            disabled={saving === u.id + "searches_limit"}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              if (!isNaN(v) && v > 0) updateUser(u.id, "searches_limit", v);
                            }}
                            className="w-14 text-xs border border-gray-200 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${Number(u.wallet_balance ?? 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setWalletModal({
                                userId: u.id,
                                name: u.name ?? u.email,
                                current: Number(u.wallet_balance ?? 0),
                              });
                              setWalletAmount("");
                              setWalletMode("add");
                            }}
                            className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          >
                            <Wallet size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {u.created_at?.split("T")[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {walletModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">Wallet Balance</h2>
                <p className="text-sm text-gray-500 mt-0.5">{walletModal.name}</p>
              </div>
              <button
                onClick={() => setWalletModal(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center">
              <p className="text-xs text-gray-500 mb-1">Current balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ${walletModal.current.toFixed(2)}
              </p>
            </div>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
              <button
                onClick={() => setWalletMode("add")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
                  walletMode === "add" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Plus size={13} /> Add Funds
              </button>
              <button
                onClick={() => setWalletMode("set")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
                  walletMode === "set" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Minus size={13} /> Set Balance
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {walletMode === "add" ? "Amount to add ($)" : "New balance ($)"}
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {walletMode === "add" &&
                walletAmount &&
                !isNaN(parseFloat(walletAmount)) && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    New balance:{" "}
                    <span className="font-semibold text-gray-700">
                      ${(walletModal.current + parseFloat(walletAmount)).toFixed(2)}
                    </span>
                  </p>
                )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setWalletModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitWallet}
                disabled={
                  walletLoading || !walletAmount || isNaN(parseFloat(walletAmount))
                }
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {walletLoading
                  ? "Saving..."
                  : walletMode === "add"
                  ? "Add Funds"
                  : "Set Balance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
