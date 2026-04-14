"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_CONFIG, canPlanSave, planHasHistory, type PlanKey } from "@/lib/plans";

interface Profile {
  name: string | null;
  email: string;
  role: string;
  plan: string;
  plan_expires_at: string | null;
  searches_used: number;
  searches_limit: number;
  wallet_balance: number;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/leads", label: "Lead Lists", icon: "☰" },
  { href: "/searches", label: "Recent Searches", icon: "⏱" },
  { href: "/billing", label: "Billing", icon: "💳" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, email, role, plan, plan_expires_at, searches_used, searches_limit, wallet_balance")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const plan = (profile?.plan ?? "free") as PlanKey;
  const planInfo = PLAN_CONFIG[plan];
  const usagePercent = profile
    ? Math.min(Math.round((profile.searches_used / profile.searches_limit) * 100), 100)
    : 0;
  const displayName = profile?.name ?? profile?.email?.split("@")[0] ?? "User";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-blue-600 font-bold text-xl">LeadHunter</span>
        </Link>
        <button
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          const isLocked =
            (link.href === "/leads" && !canPlanSave(plan)) ||
            (link.href === "/searches" && !planHasHistory(plan));
          const isExpired = profile?.plan_expires_at && profile.plan !== "free"
            ? new Date(profile.plan_expires_at) < new Date()
            : false;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : isLocked
                  ? "text-gray-400 hover:bg-gray-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
              {link.href === "/billing" && isExpired && (
                <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                  Expired
                </span>
              )}
              {isLocked && link.href !== "/billing" && (
                <Lock size={11} className="ml-auto text-gray-300 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usage */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planInfo.badge}`}>
              {planInfo.label}
            </span>
            <span className="text-xs text-gray-400">
              {profile?.searches_used ?? 0} / {profile?.searches_limit ?? 5}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Searches this month</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            {profile?.plan === "free" ? (
              <Link href="/billing" className="text-xs font-semibold text-blue-600 hover:underline">
                ↑ Upgrade Plan
              </Link>
            ) : (
              <Link href="/billing" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                Manage plan
              </Link>
            )}
            {/* Wallet */}
            {(profile?.wallet_balance ?? 0) > 0 && (
              <span className="text-xs font-semibold text-green-600">
                ${Number(profile?.wallet_balance ?? 0).toFixed(2)} wallet
              </span>
            )}
          </div>
        </div>

        {/* User */}
        <div className="mt-3 flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Admin link — only for admin users */}
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span>🛡</span> Admin Panel
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <Link href="/" className="text-blue-600 font-bold text-lg">
          LeadHunter
        </Link>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
          md:static md:w-60 md:translate-x-0 md:flex
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
