import type { Lead } from "@/lib/mock-data";
import Link from "next/link";

interface LeadCardProps {
  lead: Lead;
  onSave?: (lead: Lead) => void;
  onAddToList?: (lead: Lead) => void;
  compact?: boolean;
  saved?: boolean;
}

export default function LeadCard({ lead, compact = false, onSave, onAddToList, saved = false }: LeadCardProps) {
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];
  const color = colors[lead.id.charCodeAt(lead.id.length - 1) % colors.length];

  const profileParams = new URLSearchParams({
    name: lead.name,
    title: lead.title,
    company: lead.company,
    location: lead.location,
    industry: lead.industry,
    url: lead.linkedinUrl,
    ...(lead.email ? { email: lead.email } : {}),
    ...(lead.phone ? { phone: lead.phone } : {}),
    ...(lead.companySize ? { size: lead.companySize } : {}),
    ...(lead.experience ? { exp: lead.experience } : {}),
  });
  const profileHref = `/profile/${lead.id}?${profileParams}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        {/* Avatar + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${color}`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={profileHref}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm"
            >
              {lead.name}
            </Link>
            <p className="text-sm text-gray-500 truncate">{lead.title}</p>
            <p className="text-sm font-medium text-gray-700 truncate">{lead.company}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <a
            href={lead.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            LinkedIn
          </a>
          {saved && onAddToList && (
            <button
              onClick={() => onAddToList(lead)}
              className="text-xs px-2.5 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + List
            </button>
          )}
          <button
            onClick={() => onSave?.(lead)}
            disabled={saved}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              saved
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            📍 {lead.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            🏢 {lead.industry}
          </span>
          {lead.companySize && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
              👥 {lead.companySize} employees
            </span>
          )}
          {lead.experience && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full capitalize">
              💼 {lead.experience}
            </span>
          )}
          {lead.email && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              ✉ {lead.email}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
