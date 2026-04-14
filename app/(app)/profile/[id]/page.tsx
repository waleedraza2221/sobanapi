"use client";
import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Building2, Users, ExternalLink, BookmarkPlus, Check } from "lucide-react";

export default function LeadProfilePageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading profile…</div>}>
      <LeadProfilePage params={params} />
    </Suspense>
  );
}

function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sp = useSearchParams();
  const [saved, setSaved] = useState(false);

  const name = sp.get("name") ?? "";
  const title = sp.get("title") ?? "";
  const company = sp.get("company") ?? "";
  const location = sp.get("location") ?? "";
  const industry = sp.get("industry") ?? "";
  const linkedinUrl = sp.get("url") ?? "#";
  const email = sp.get("email") ?? undefined;
  const phone = sp.get("phone") ?? undefined;
  const companySize = sp.get("size") ?? undefined;
  const experience = sp.get("exp") ?? undefined;

  if (!name) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-medium">Lead not found.</p>
        <Link href="/search" className="text-blue-600 text-sm hover:underline mt-2 block">
          Back to Search
        </Link>
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fields = [
    { icon: Briefcase, label: "Title", value: title },
    { icon: Building2, label: "Company", value: company },
    { icon: MapPin, label: "Location", value: location },
    { icon: Users, label: "Industry", value: industry },
    ...(companySize ? [{ icon: Users, label: "Company Size", value: `${companySize} employees` }] : []),
    ...(experience ? [{ icon: Briefcase, label: "Experience Level", value: experience }] : []),
  ];

  async function handleSave() {
    if (saved) return;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, title, company, location, industry, linkedinUrl, email, phone, companySize, experience }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Search
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <p className="text-gray-500">{title}</p>
              <p className="text-sm font-medium text-gray-700">{company}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} /> LinkedIn
            </a>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                saved
                  ? "bg-green-100 text-green-700 cursor-default"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {saved ? <><Check size={14} /> Saved</> : <><BookmarkPlus size={14} /> Save Lead</>}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {(email || phone) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Contact</h2>
          <div className="space-y-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail size={15} className="text-gray-400" />
                {email}
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Phone size={15} className="text-gray-400" />
                {phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-medium text-gray-800 capitalize">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


  if (!lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-medium">Lead not found.</p>
        <Link href="/search" className="text-blue-600 text-sm hover:underline mt-2 block">
          Back to Search
        </Link>
      </div>
    );
  }

  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fields = [
    { icon: Briefcase, label: "Title", value: lead.title },
    { icon: Building2, label: "Company", value: lead.company },
    { icon: MapPin, label: "Location", value: lead.location },
    { icon: Users, label: "Industry", value: lead.industry },
    ...(lead.companySize ? [{ icon: Users, label: "Company Size", value: `${lead.companySize} employees` }] : []),
    ...(lead.experience ? [{ icon: Briefcase, label: "Experience Level", value: lead.experience }] : []),
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Search
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
              <p className="text-gray-500">{lead.title}</p>
              <p className="text-sm font-medium text-gray-700">{lead.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} /> LinkedIn
            </a>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <BookmarkPlus size={14} /> Save Lead
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {(lead.email || lead.phone) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Contact</h2>
          <div className="space-y-3">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail size={15} className="text-gray-400" />
                {lead.email}
              </a>
            )}
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Phone size={15} className="text-gray-400" />
                {lead.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-medium text-gray-800 capitalize">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
