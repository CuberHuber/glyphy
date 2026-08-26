/**
 * The clock.
 *
 * Every mark on a page reads the same counter. That is deliberate: a row of
 * marks with staggered phases only reads as one ring travelling across the row
 * if they share a clock. Nine separate timers would drift apart within
 * seconds and the effect would collapse.
 *
 * The clock runs only while something is listening, so an unmounted mark costs
 * nothing and a server render never starts a timer at all.
 */

import { TICK_MS } from './variants.js';

/** Called on every tick with the new counter value. */
export type TickListener = (tick: number) => void;

/** Undo a subscription. Safe to call more than once. */
export type Unsubscribe = () => void;

/** A shared, lazily running tick counter. */
export interface Clock {
  /** The current tick. Starts at 0 and only increases. */
  readonly tick: number;
  /** Milliseconds between ticks. */
  readonly period: number;
  /** Whether a timer is currently scheduled. */
  readonly running: boolean;
  /** Listen for ticks. The clock starts on the first listener. */
  subscribe(listener: TickListener): Unsubscribe;
  /** Advance by one tick by hand. Used by tests and by manual drivers. */
  advance(ticks?: number): void;
  /** Stop the timer and drop every listener. */
  destroy(): void;
}

class IntervalClock implements Clock {
  #tick = 0;

  #timer: ReturnType<typeof setInterval> | undefined;

  readonly #listeners = new Set<TickListener>();

  readonly #period: number;

  constructor(period: number) {
    this.#period = period;
  }

  get tick(): number {
    return this.#tick;
  }

  get period(): number {
    return this.#period;
  }

  get running(): boolean {
    return this.#timer !== undefined;
  }

  subscribe(listener: TickListener): Unsubscribe {
    this.#listeners.add(listener);
    this.#sync();
    let live = true;
    return () => {
      if (!live) return;
      live = false;
      this.#listeners.delete(listener);
      this.#sync();
    };
  }

  advance(ticks = 1): void {
    this.#tick += ticks;
    for (const listener of [...this.#listeners]) listener(this.#tick);
  }

  destroy(): void {
    this.#listeners.clear();
    this.#sync();
  }

  #sync(): void {
    const wanted = this.#listeners.size > 0;
    if (wanted && this.#timer === undefined) {
      this.#timer = setInterval(() => {
        this.advance(1);
      }, this.#period);
      // Never hold a Node process open for an animation.
      (this.#timer as { unref?: () => void }).unref?.();
    } else if (!wanted && this.#timer !== undefined) {
      clearInterval(this.#timer);
      this.#timer = undefined;
    }
  }
}

/** A clock of its own. Prefer {@link sharedClock} unless you need isolation. */
export function createClock(period: number = TICK_MS): Clock {
  return new IntervalClock(period);
}

const shared = new Map<number, Clock>();

/**
 * The clock every mark of a given period shares.
 *
 * @param period - Milliseconds between ticks. Defaults to {@link TICK_MS}.
 */
export function sharedClock(period: number = TICK_MS): Clock {
  const existing = shared.get(period);
  if (existing !== undefined) return existing;
  const clock = createClock(period);
  shared.set(period, clock);
  return clock;
}

/** Forget every shared clock. For tests, and for hot reload. */
export function resetSharedClocks(): void {
  for (const clock of shared.values()) clock.destroy();
  shared.clear();
}

/** The phase offset for the nth mark in a staggered row. */
export function phaseFor(index: number, stepsApart = 2): number {
  return index * stepsApart;
}
