type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

export function installFakeIntersectionObserver() {
  const instances: { observed: Element[]; disconnected: boolean; callback: Callback }[] = [];

  class FakeIntersectionObserver {
    observed: Element[] = [];
    disconnected = false;
    callback: Callback;
    constructor(callback: Callback) {
      this.callback = callback;
      instances.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve() {}
    disconnect() {
      this.disconnected = true;
    }
    takeRecords() {
      return [];
    }
  }

  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

  return {
    instances,
    trigger(target: Element, isIntersecting: boolean) {
      for (const io of instances) {
        if (!io.disconnected && io.observed.includes(target)) io.callback([{ target, isIntersecting }]);
      }
    },
    restore() {
      globalThis.IntersectionObserver = original;
    },
  };
}
