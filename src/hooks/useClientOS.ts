import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import type { ActivityCategory, ClientOSData, Lead, LeadStatus } from "../types";
import { event, evaluateStreak, normalizeData, seedData } from "../lib/data";
import { supabase } from "../lib/supabase";
import { uid } from "../lib/utils";

function storageKey(user: User | null, localMode: boolean) {
  return user ? `clientos:${user.id}` : localMode ? "clientos:local" : "clientos:guest";
}

async function loadData(user: User | null, localMode: boolean) {
  const key = storageKey(user, localMode);
  const cached = localStorage.getItem(key);
  const cachedData = cached ? normalizeData(JSON.parse(cached)) : null;
  const supabaseClient = supabase;

  if (supabaseClient && user) {
    const { data, error } = await supabaseClient.from("app_state").select("state").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    const remoteData = data?.state ? normalizeData(data.state) : cachedData ?? seedData();
    localStorage.setItem(key, JSON.stringify(remoteData));
    return evaluateStreak(remoteData);
  }

  return evaluateStreak(cachedData ?? seedData());
}

async function persistData(data: ClientOSData, user: User | null, localMode: boolean) {
  const key = storageKey(user, localMode);
  localStorage.setItem(key, JSON.stringify(data));
  const supabaseClient = supabase;

  if (supabaseClient && user) {
    await supabaseClient.from("app_state").upsert({
      user_id: user.id,
      state: data,
      updated_at: new Date().toISOString(),
    });
  }
}

export function useClientOS(user: User | null, localMode: boolean) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["clientos-data", user?.id ?? (localMode ? "local" : "guest")], [localMode, user?.id]);

  const query = useQuery({
    queryKey,
    queryFn: () => loadData(user, localMode),
    enabled: Boolean(user || localMode),
  });

  useEffect(() => {
    const supabaseClient = supabase;
    if (!supabaseClient || !user) return;

    const channel = supabaseClient
      .channel(`app-state-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_state", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const remote = normalizeData((payload.new as { state?: unknown }).state);
          queryClient.setQueryData(queryKey, evaluateStreak(remote));
        },
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [queryClient, queryKey, user]);

  const updateData = (recipe: (data: ClientOSData) => ClientOSData) => {
    const current = queryClient.getQueryData<ClientOSData>(queryKey) ?? seedData();
    const next = evaluateStreak(recipe(structuredClone(current)));
    queryClient.setQueryData(queryKey, next);
    void persistData(next, user, localMode);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    incrementActivity(id: string) {
      updateData((data) => {
        const activity = data.activities.find((item) => item.id === id);
        if (!activity) return data;
        activity.count += 1;
        data.timeline.unshift(event("activity", `+1 ${activity.name}`, `${activity.count}/${activity.dailyGoal} completed.`, activity.source));
        return data;
      });
    },
    decrementActivity(id: string) {
      updateData((data) => {
        const activity = data.activities.find((item) => item.id === id);
        if (!activity) return data;
        activity.count = Math.max(0, activity.count - 1);
        data.timeline.unshift(event("activity", `-1 ${activity.name}`, `${activity.count}/${activity.dailyGoal} completed.`, activity.source));
        return data;
      });
    },
    resetActivity(id: string) {
      updateData((data) => {
        const activity = data.activities.find((item) => item.id === id);
        if (!activity) return data;
        activity.count = 0;
        data.timeline.unshift(event("activity", `${activity.name} reset`, "Daily count reset to zero.", activity.source));
        return data;
      });
    },
    updateActivity(id: string, patch: Partial<ActivityCategory>) {
      updateData((data) => {
        data.activities = data.activities.map((item) => (item.id === id ? { ...item, ...patch } : item));
        return data;
      });
    },
    addActivity(name: string, dailyGoal: number, source: string) {
      updateData((data) => {
        data.activities.push({
          id: uid("activity"),
          name,
          dailyGoal,
          count: 0,
          notes: "",
          source,
          createdAt: new Date().toISOString(),
        });
        data.timeline.unshift(event("activity", "Activity category added", name, source));
        return data;
      });
    },
    deleteActivity(id: string) {
      updateData((data) => {
        const activity = data.activities.find((item) => item.id === id);
        data.activities = data.activities.filter((item) => item.id !== id);
        if (activity) data.timeline.unshift(event("activity", "Activity category removed", activity.name, activity.source));
        return data;
      });
    },
    addLead(lead: Lead) {
      updateData((data) => {
        const nextLead = { ...lead, id: uid("lead"), dateAdded: new Date().toISOString() };
        data.leads.unshift(nextLead);
        data.timeline.unshift(event("lead", "New lead added", nextLead.businessName, nextLead.platform));
        return data;
      });
    },
    updateLead(id: string, patch: Partial<Lead>) {
      updateData((data) => {
        data.leads = data.leads.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead));
        return data;
      });
    },
    moveLead(id: string, status: LeadStatus) {
      updateData((data) => {
        const lead = data.leads.find((item) => item.id === id);
        if (!lead || lead.status === status) return data;
        lead.status = status;
        data.timeline.unshift(event("lead", `Lead moved to ${status}`, lead.businessName, lead.platform));
        if (status === "Won") data.timeline.unshift(event("achievement", "Client won", lead.businessName, lead.platform));
        return data;
      });
    },
    deleteLead(id: string) {
      updateData((data) => {
        const lead = data.leads.find((item) => item.id === id);
        data.leads = data.leads.filter((item) => item.id !== id);
        if (lead) data.timeline.unshift(event("lead", "Lead removed", lead.businessName, lead.platform));
        return data;
      });
    },
  };
}
