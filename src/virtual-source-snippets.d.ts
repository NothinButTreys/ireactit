declare module 'virtual:source-snippets' {
  const snippets: Record<
    'mount' | 'write' | 'tree' | 'props' | 'commit',
    { filename: string; html: string; lines: number }
  >;
  export default snippets;
}
