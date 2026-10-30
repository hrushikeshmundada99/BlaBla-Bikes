"use client";

import * as React from "react";
import { addEmergencyContactAction, deleteEmergencyContactAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Trash2, Plus, ShieldAlert, RotateCw } from "lucide-react";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export function EmergencyContactsManager({
  contacts = [],
}: {
  contacts: EmergencyContact[];
}) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAddContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await addEmergencyContactAction(null, formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to add contact.");
    } else {
      setShowAddForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await deleteEmergencyContactAction(id);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Emergency Contacts ({contacts.length}/3)</span>
          </h4>
          <p className="text-xs text-slate-500">
            Contacts alerted immediately if SOS is triggered during a ride.
          </p>
        </div>

        {contacts.length < 3 && !showAddForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="rounded-xl text-xs gap-1.5 border-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      {/* List of contacts */}
      {contacts.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          No emergency contacts added yet. Add trusted family or friends.
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{contact.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {contact.phone} {contact.email ? `• ${contact.email}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(contact.id)}
                disabled={deleteId === contact.id}
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              >
                {deleteId === contact.id ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add contact form */}
      {showAddForm && (
        <form
          onSubmit={handleAddContact}
          className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3 animate-in fade-in-50"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Contact Name</label>
            <Input name="name" required placeholder="e.g. Rahul Sharma" className="h-9 text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Phone Number</label>
            <Input
              name="phone"
              required
              placeholder="e.g. 9822012345"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Email (Optional)</label>
            <Input name="email" type="email" placeholder="e.g. rahul@example.com" className="h-9 text-xs" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#1853DB] text-white text-xs"
            >
              {loading ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

