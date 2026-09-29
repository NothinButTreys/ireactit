export function matchMediaFor(matching: readonly string[] = []) {
  return (query: string): MediaQueryList =>
    ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

export function mockMatchMedia(matching: readonly string[]): void {
  window.matchMedia = matchMediaFor(matching);
}
