"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/leads", label: "Lead Lists", icon: "☰" },
  { href: "/searches", label: "Recent Searches", icon: "⏱" },
  { href: "/pricing", label: "Upgrade", icon: "★" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const usagePercent = Math.round((mockUser.searchesUsed / mockUser.searchesLimit) * 100);

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-xl">LeadHunter</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
              {link.href === "/pricing" && (
                <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usage */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Searches used</span>
            <span>
              {mockUser.searchesUsed} / {mockUser.searchesLimit}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 capitalize">{mockUser.plan} Plan</span>
            <Link href="/pricing" className="text-xs text-blue-600 hover:underline font-medium">
              Upgrade
            </Link>
          </div>
        </div>

        {/* User */}
        <div className="mt-3 flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {mockUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{mockUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
