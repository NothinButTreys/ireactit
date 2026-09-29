import { SECTION_IDS, SECTION_LABELS } from '@/content/sections';
import { profile } from '@/content/profile';
import { Nav } from '@/features/nav/Nav';
import { Section } from '@/ui/Section';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pt-14">
        {SECTION_IDS.map((id) => (
          <Section key={id} id={id} className="flex min-h-svh flex-col justify-center py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{id}</p>
            {id === 'mount' ? (
              <>
                <h1 id="mount-title" className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
                  {profile.greeting}
                </h1>
                <p className="mt-4 text-xl text-muted">
                  {profile.role}. {profile.subline}
                </p>
              </>
            ) : (
              <h2 id={`${id}-title`} className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                {SECTION_LABELS[id]}
              </h2>
            )}
          </Section>
        ))}
      </main>
    </Providers>
  );
}
