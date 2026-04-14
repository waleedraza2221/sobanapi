"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import LeadCard from "@/components/LeadCard";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import type { Lead } from "@/lib/mock-data";

interface LeadList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [list, setList] = useState<LeadList | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/lists?id=${id}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setList(data.list);
      setLeads(data.leads ?? []);
      setSavedIds(new Set((data.leads ?? []).map((l: Lead) => l.id)));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-medium">List not found.</p>
        <Link href="/leads" className="text-blue-600 text-sm hover:underline mt-2 block">
          Back to Lead Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Lists
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900">{list.name}</h1>
        {list.description && <p className="text-gray-500 text-sm mt-1">{list.description}</p>}
        <div className="flex items-center gap-5 mt-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Users size={13} /> {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> Created {list.created_at?.split("T")[0]}
          </span>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No leads in this list yet</p>
          <Link href="/search" className="text-blue-600 text-sm hover:underline mt-2 block">
            Search for leads →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              saved={savedIds.has(lead.id)}
              onSave={() => {}}
              onAddToList={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}


  if (!list) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 font-medium">List not found.</p>
        <Link href="/leads" className="text-blue-600 text-sm hover:underline mt-2 block">
          Back to Lead Lists
        </Link>
      </div>
    );
  }

  // Show mock leads for this list (filtered by list reference in lead.lists)
  const leads = mockLeads.filter((l) => l.lists?.includes(list.id)).slice(0, list.leadCount || 3);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> Back to Lists
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900">{list.name}</h1>
        {list.description && <p className="text-gray-500 text-sm mt-1">{list.description}</p>}
        <div className="flex items-center gap-5 mt-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Users size={13} /> {list.leadCount} leads
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> Created {list.createdAt}
          </span>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Users size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No leads in this list yet</p>
          <Link href="/search" className="text-blue-600 text-sm hover:underline mt-2 block">
            Search for leads →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onSave={() => {}} onAddToList={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
