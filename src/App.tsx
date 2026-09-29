import { profile } from '@/content/profile';
import { Nav } from '@/features/nav/Nav';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { Section } from '@/ui/Section';
import { SectionHeader } from '@/ui/SectionHeader';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <SmoothScroll />
      <div aria-hidden className="dots-drift" />
      <Nav />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[78rem] px-4 pt-14 pb-[30vh] outline-none md:px-8">
        <Section id="mount" className="flex min-h-svh items-center py-16">
          <h1 id="mount-title" className="text-[64px] leading-[0.95] font-bold tracking-[-0.045em] md:text-[120px]">
            {profile.greeting}
          </h1>
        </Section>
        <Section id="write" className="py-24">
          <SectionHeader
            num="02"
            step="write"
            title="Written in TypeScript. Rendered live."
            sub="Change a prop and watch the component re-render — the counter in the nav keeps score."
          />
        </Section>
        <Section id="tree" className="py-24">
          <SectionHeader num="03" step="tree" title="One component tree." />
        </Section>
        <Section id="props" className="py-24">
          <SectionHeader
            num="04"
            step="props"
            title="Things I've shipped."
            sub="Each project is a component. Inspect one to see its tree, its props and the decisions behind it."
          />
        </Section>
        <Section id="commit" className="py-24">
          <SectionHeader
            num="05"
            step="commit"
            title="Let's build something."
            sub="Commit a message straight to my inbox. Or skip the terminal and find me below."
          />
        </Section>
      </main>
    </Providers>
  );
}
