type Options = {
  limit: number;
  windowMs: number;
  now?: () => number;
  /** Test-only override for the backing store, to make eviction observable. */
  store?: Map<string, number[]>;
};

/** Best-effort, per-instance sliding window. Serverless instances do not share it. */
export function createRateLimiter({ limit, windowMs, now = Date.now, store }: Options) {
  const hits = store ?? new Map<string, number[]>();
  return (key: string): boolean => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((ts) => t - ts < windowMs);
    const allowed = recent.length < limit;
    if (allowed) recent.push(t);
    if (recent.length === 0) hits.delete(key);
    else hits.set(key, recent);
    return allowed;
  };
}
