declare module 'virtual:source-snippets' {
  const snippets: Record<
    import('./content/sections').SectionId,
    { filename: string; html: string; lines: number }
  >;
  export default snippets;
}
