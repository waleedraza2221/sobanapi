"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-blue-600 font-bold text-xl">
          LeadHunter
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-gray-900 transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}
