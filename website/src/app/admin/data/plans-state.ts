import { isPlatformServer } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { PLAN_GROUPS, PlanStatus } from './plans';

const STORAGE_KEY = 'admin-plan-status';

const isStatus = (value: unknown): value is PlanStatus =>
  value === 'todo' || value === 'doing' || value === 'done';

/**
 * Plans tracker state: item id → status, persisted per browser in
 * localStorage. PLAN_GROUPS is the source of truth for items; stored
 * entries for unknown ids are dropped, unknown items default to todo.
 */
@Injectable({ providedIn: 'root' })
export class PlansState {
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly statuses = signal<Record<string, PlanStatus>>(this.load());

  readonly overall = computed(() => {
    const statuses = this.statuses();
    let total = 0;
    let done = 0;
    let doing = 0;
    for (const group of PLAN_GROUPS) {
      for (const item of group.items) {
        total += 1;
        const status = statuses[item.id] ?? 'todo';
        if (status === 'done') done += 1;
        else if (status === 'doing') doing += 1;
      }
    }
    return { total, done, doing, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  });

  status(id: string): PlanStatus {
    return this.statuses()[id] ?? 'todo';
  }

  groupProgress(groupId: string): { total: number; done: number; pct: number } {
    const group = PLAN_GROUPS.find((candidate) => candidate.id === groupId);
    if (!group) return { total: 0, done: 0, pct: 0 };
    const statuses = this.statuses();
    const done = group.items.filter((item) => (statuses[item.id] ?? 'todo') === 'done').length;
    return { total: group.items.length, done, pct: group.items.length === 0 ? 0 : Math.round((done / group.items.length) * 100) };
  }

  setStatus(id: string, status: PlanStatus): void {
    const next = { ...this.statuses() };
    if (status === 'todo') delete next[id];
    else next[id] = status;
    this.statuses.set(next);
    this.save(next);
  }

  advance(id: string): void {
    const current = this.status(id);
    this.setStatus(id, current === 'todo' ? 'doing' : current === 'doing' ? 'done' : 'todo');
  }

  resetAll(): void {
    this.statuses.set({});
    this.save({});
  }

  private load(): Record<string, PlanStatus> {
    if (this.isServer) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return {};
      const known = new Set(PLAN_GROUPS.flatMap((group) => group.items.map((item) => item.id)));
      const clean: Record<string, PlanStatus> = {};
      for (const [id, value] of Object.entries(parsed)) {
        if (known.has(id) && isStatus(value) && value !== 'todo') clean[id] = value;
      }
      return clean;
    } catch {
      return {};
    }
  }

  private save(statuses: Record<string, PlanStatus>): void {
    if (this.isServer) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // Storage full or blocked: the tracker still works for this session.
    }
  }
}
