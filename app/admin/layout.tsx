"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, ArrowLeft } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft size={12} /> Back to App
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-lg">LeadHunter</span>
            <span className="text-xs font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
