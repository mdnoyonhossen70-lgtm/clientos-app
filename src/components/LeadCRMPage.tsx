import { useMemo, useState, type FormEvent } from "react";
import { Calendar, GripVertical, Mail, Phone, Plus, Trash2, type LucideIcon } from "lucide-react";
import type { ClientOSData, Lead, LeadStatus } from "../types";
import { leadStatuses, statusAccent } from "../lib/constants";
import { emptyLead } from "../lib/data";
import { formatShortDate } from "../lib/date";
import { useClientOS } from "../hooks/useClientOS";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Select, Textarea } from "./ui/form";

type Actions = ReturnType<typeof useClientOS>;

export function LeadCRMPage({ data, actions }: { data: ClientOSData; actions: Actions }) {
  const [draft, setDraft] = useState<Lead>(() => emptyLead());
  const grouped = useMemo(
    () => leadStatuses.map((status) => ({ status, leads: data.leads.filter((lead) => lead.status === status) })),
    [data.leads],
  );

  function addLead(event: FormEvent) {
    event.preventDefault();
    if (!draft.businessName.trim()) return;
    actions.addLead(draft);
    setDraft(emptyLead(draft.status));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">Lead CRM</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-normal">Pipeline board</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Drag prospects across statuses and keep the acquisition machine visible.</p>
        </div>
      </header>

      <Card className="p-4">
        <form onSubmit={addLead} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Business name" value={draft.businessName} onChange={(event) => setDraft({ ...draft, businessName: event.target.value })} />
          <Input placeholder="Contact name" value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} />
          <Input placeholder="Platform" value={draft.platform} onChange={(event) => setDraft({ ...draft, platform: event.target.value })} />
          <Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as LeadStatus })}>
            {leadStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
          <Input placeholder="Website" value={draft.website} onChange={(event) => setDraft({ ...draft, website: event.target.value })} />
          <Input placeholder="Email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          <Input placeholder="Phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          <Button type="submit" variant="primary">
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
          <Textarea
            placeholder="Notes"
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            className="md:col-span-2 xl:col-span-4"
          />
        </form>
      </Card>

      <section className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-7">
        {grouped.map((column) => (
          <div
            key={column.status}
            className="min-h-72 min-w-72 rounded-lg border border-white/10 bg-white/[0.025] p-3 xl:min-w-0"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const id = event.dataTransfer.getData("text/lead-id");
              if (id) actions.moveLead(id, column.status);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-lg border px-2 py-1 text-xs font-bold ${statusAccent[column.status]}`}>{column.status}</span>
              <span className="text-xs font-bold text-white/45">{column.leads.length}</span>
            </div>

            <div className="space-y-3">
              {column.leads.map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/lead-id", lead.id)}
                  className="cursor-grab p-3 active:cursor-grabbing"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold">{lead.businessName}</h3>
                      <p className="truncate text-xs text-white/45">{lead.contactName || lead.platform}</p>
                    </div>
                    <GripVertical className="h-4 w-4 shrink-0 text-white/25" />
                  </div>

                  <LeadInput value={lead.platform} onChange={(value) => actions.updateLead(lead.id, { platform: value })} placeholder="Platform" />
                  <LeadInput value={lead.website} onChange={(value) => actions.updateLead(lead.id, { website: value })} placeholder="Website" />
                  <LeadInput value={lead.email} onChange={(value) => actions.updateLead(lead.id, { email: value })} placeholder="Email" icon={Mail} />
                  <LeadInput value={lead.phone} onChange={(value) => actions.updateLead(lead.id, { phone: value })} placeholder="Phone" icon={Phone} />

                  <Textarea
                    value={lead.notes}
                    onChange={(event) => actions.updateLead(lead.id, { notes: event.target.value })}
                    placeholder="Notes"
                    className="mt-2 min-h-16 text-xs"
                  />

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/35">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatShortDate(lead.dateAdded)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => actions.deleteLead(lead.id)} aria-label="Delete lead">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function LeadInput({
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="relative mt-2">
      {Icon && <Icon className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-white/25" />}
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={Icon ? "h-8 pl-8 text-xs" : "h-8 text-xs"} />
    </div>
  );
}
