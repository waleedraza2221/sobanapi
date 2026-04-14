"use client";
import { useState } from "react";
import Link from "next/link";
import { mockLists } from "@/lib/mock-data";
import { Users, Plus, MoreHorizontal, Calendar, X } from "lucide-react";

const colors = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700"];

export default function LeadsPage() {
  const [lists, setLists] = useState(mockLists);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLists((prev) => [
      ...prev,
      {
        id: `list-${Date.now()}`,
        name: newName.trim(),
        description: newDesc.trim(),
        leadCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewName("");
    setNewDesc("");
    setShowModal(false);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Lists</h1>
          <p className="text-gray-500 mt-1">Organise your saved leads into collections.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} /> New List
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
          <Users size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-700">No lists yet</p>
          <p className="text-sm text-gray-400 mt-1">Create a list to start organising your leads.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Create your first list
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {lists.map((list, idx) => (
            <Link
              key={list.id}
              href={`/leads/${list.id}`}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all block"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${colors[idx % colors.length]}`}
                >
                  {list.name.charAt(0)}
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {list.name}
              </h3>
              {list.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{list.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users size={12} />
                  {list.leadCount} lead{list.leadCount !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={12} />
                  {list.createdAt}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New List Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Create New List</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={createList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">List name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. SaaS Founders Q1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional description…"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
