import { CareerTree } from '@/features/career-tree/CareerTree';
import { CommitSection } from '@/features/contact/CommitSection';
import { Footer } from '@/features/footer/Footer';
import { Hero } from '@/features/hero/Hero';
import { WriteSection } from '@/features/ide/WriteSection';
import { Nav } from '@/features/nav/Nav';
import { Projects } from '@/features/projects/Projects';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { Section } from '@/ui/Section';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <SmoothScroll />
      <div aria-hidden className="dots-drift" />
      <Nav />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[78rem] px-4 pt-14 pb-24 outline-none md:px-8 md:pb-0"
      >
        <Section id="mount" className="flex min-h-svh items-center py-16">
          <Hero />
        </Section>
        <Section id="write" className="py-24">
          <WriteSection />
        </Section>
        <Section id="tree">
          <CareerTree />
        </Section>
        <Section id="props" className="py-24">
          <Projects />
        </Section>
        <Section id="commit" className="py-24">
          <CommitSection />
        </Section>
      </main>
      <Footer />
    </Providers>
  );
}
