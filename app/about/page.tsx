import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ChevronRight, Mail, MapPin } from "lucide-react";

const team = [
  {
    name: "Soban Arshad",
    role: "Founder & CEO",
    avatar: "SA",
    color: "bg-blue-600",
    bio: "Built LeadHunter to solve the pain of manual prospecting. Previously led growth at multiple SaaS companies.",
  },
  {
    name: "Ahmad Raza",
    role: "Lead Engineer",
    avatar: "AR",
    color: "bg-purple-600",
    bio: "Full-stack engineer focused on data pipelines and scalable APIs. Obsessed with developer experience.",
  },
  {
    name: "Sara Khan",
    role: "Head of Product",
    avatar: "SK",
    color: "bg-green-600",
    bio: "Designs the workflows that make lead generation feel effortless. 5+ years in B2B product design.",
  },
];

const values = [
  {
    icon: "⚡",
    title: "Speed first",
    desc: "Every feature is optimised for speed. Prospecting should take minutes, not hours.",
  },
  {
    icon: "🎯",
    title: "Data accuracy",
    desc: "We use live LinkedIn data via BrightData — not stale databases. What you see is real.",
  },
  {
    icon: "🔐",
    title: "Privacy & security",
    desc: "Your searches, leads, and account data are encrypted and never sold or shared.",
  },
  {
    icon: "🤝",
    title: "Transparent pricing",
    desc: "No hidden fees. Simple monthly plans with manual payment options that work locally.",
  },
];

const milestones = [
  { year: "2024", event: "LeadHunter concept started. First prototype built." },
  { year: "Early 2025", event: "Beta launched to first 50 users. BrightData integration live." },
  { year: "Mid 2025", event: "Reached 500 active users. Added lead lists and CSV export." },
  { year: "2026", event: "Full platform rewrite. Supabase backend, mobile-first UI, admin panel." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-6 uppercase">
          Our story
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
          Built by founders, <span className="text-blue-600">for founders</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          LeadHunter was born from frustration — spending hours manually hunting LinkedIn for leads.
          We built the tool we wished existed: fast, accurate, and affordable.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            To make professional lead generation accessible to every business — whether you&apos;re a solo founder
            or a growing sales team. We believe finding the right people shouldn&apos;t require a massive budget
            or technical expertise.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What we stand for</h2>
          <p className="text-gray-500">The principles that guide every decision we make.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{v.title}</h3>
              <p className="text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 border-y border-gray-100 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our journey</h2>
            <p className="text-gray-500">From idea to product.</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex flex-col sm:flex-row gap-4 sm:gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className="flex-1 sm:text-right">
                    {i % 2 === 0 && (
                      <div className="sm:block hidden">
                        <span className="font-bold text-blue-600">{m.year}</span>
                        <p className="text-gray-600 text-sm mt-1">{m.event}</p>
                      </div>
                    )}
                    {i % 2 !== 0 && <div className="sm:block hidden" />}
                  </div>
                  <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow z-10" />
                  </div>
                  <div className="flex-1">
                    <div className="sm:hidden">
                      <span className="font-bold text-blue-600">{m.year}</span>
                      <p className="text-gray-600 text-sm mt-1">{m.event}</p>
                    </div>
                    {i % 2 !== 0 && (
                      <div className="sm:block hidden">
                        <span className="font-bold text-blue-600">{m.year}</span>
                        <p className="text-gray-600 text-sm mt-1">{m.event}</p>
                      </div>
                    )}
                    {i % 2 === 0 && <div className="sm:block hidden" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">The team</h2>
          <p className="text-gray-500">Small team, big product.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-white border border-gray-200 rounded-2xl p-7 text-center hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 rounded-2xl ${member.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                {member.avatar}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in touch</h2>
          <p className="text-gray-500 mb-8">Questions, partnerships, or enterprise inquiries — we&apos;re happy to talk.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="mailto:hello@leadhunter.io"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Mail size={16} />
              hello@leadhunter.io
            </a>
            <span className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} />
              Pakistan 🇵🇰
            </span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start for Free <ChevronRight size={15} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} LeadHunter. All rights reserved.</p>
      </footer>
    </div>
  );
}
