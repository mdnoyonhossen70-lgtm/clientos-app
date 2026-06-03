import { useState, type FormEvent } from "react";
import { Minus, Plus, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ClientOSData } from "../types";
import { percentage } from "../lib/utils";
import { useClientOS } from "../hooks/useClientOS";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input, Textarea } from "./ui/form";
import { Progress } from "./ui/progress";

type Actions = ReturnType<typeof useClientOS>;

export function TrackerPage({ data, actions }: { data: ClientOSData; actions: Actions }) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(5);
  const [source, setSource] = useState("Custom");

  function addActivity(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    actions.addActivity(name.trim(), goal, source.trim() || name.trim());
    setName("");
    setGoal(5);
    setSource("Custom");
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-accent">Daily tracker</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-normal">Outreach execution</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Tune targets, record notes, and keep every channel moving without friction.</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-4 lg:grid-cols-2">
          {data.activities.map((activity, index) => {
            const value = percentage(activity.count, activity.dailyGoal);
            return (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Input
                        value={activity.name}
                        onChange={(event) => actions.updateActivity(activity.id, { name: event.target.value })}
                        className="border-transparent bg-transparent px-0 text-base font-bold"
                      />
                      <Input
                        value={activity.source}
                        onChange={(event) => actions.updateActivity(activity.id, { source: event.target.value })}
                        className="mt-1 h-8 border-transparent bg-transparent px-0 text-xs text-white/45"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => actions.deleteActivity(activity.id)} aria-label="Delete activity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
                    <label className="text-xs font-semibold uppercase text-white/35">
                      Daily goal
                      <Input
                        type="number"
                        min={1}
                        value={activity.dailyGoal}
                        onChange={(event) => actions.updateActivity(activity.id, { dailyGoal: Number(event.target.value) || 1 })}
                        className="mt-2"
                      />
                    </label>
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-center">
                      <p className="text-xs text-white/40">Count</p>
                      <p className="text-2xl font-extrabold">{activity.count}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-white/45">
                      <span>{value}% complete</span>
                      <span>
                        {activity.count} / {activity.dailyGoal}
                      </span>
                    </div>
                    <Progress value={value} />
                  </div>

                  <Textarea
                    value={activity.notes}
                    onChange={(event) => actions.updateActivity(activity.id, { notes: event.target.value })}
                    placeholder="Notes for today's outreach..."
                    className="mt-4"
                  />

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button variant="secondary" onClick={() => actions.decrementActivity(activity.id)}>
                      <Minus className="h-4 w-4" />
                      Decrease
                    </Button>
                    <Button variant="primary" onClick={() => actions.incrementActivity(activity.id)}>
                      <Plus className="h-4 w-4" />
                      Increase
                    </Button>
                    <Button variant="secondary" onClick={() => actions.resetActivity(activity.id)}>
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="h-fit p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold">Add category</h2>
          </div>
          <form onSubmit={addActivity} className="space-y-3">
            <Input placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} />
            <Input placeholder="Source" value={source} onChange={(event) => setSource(event.target.value)} />
            <Input type="number" min={1} value={goal} onChange={(event) => setGoal(Number(event.target.value) || 1)} />
            <Button type="submit" variant="primary" className="w-full">
              <Plus className="h-4 w-4" />
              Add activity
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
