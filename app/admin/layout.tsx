import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 font-bold text-xl">
            LeadHunter
          </Link>
          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded">
            ADMIN
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Back to App
        </Link>
      </header>
      <main className="p-6 md:p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
