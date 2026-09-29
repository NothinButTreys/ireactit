import { CareerTree } from '@/features/career-tree/CareerTree';
import { CommitSection } from '@/features/contact/CommitSection';
import { Footer } from '@/features/footer/Footer';
import { Hero } from '@/features/hero/Hero';
import { WriteSection } from '@/features/ide/WriteSection';
import { Nav } from '@/features/nav/Nav';
import { Projects } from '@/features/projects/Projects';
import { SectionView } from '@/features/view-source/SectionView';
import { SmoothScroll } from '@/lib/SmoothScroll';
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
        <SectionView id="mount" className="flex min-h-svh items-center py-16">
          <Hero />
        </SectionView>
        <SectionView id="write" className="py-24">
          <WriteSection />
        </SectionView>
        <SectionView id="tree">
          <CareerTree />
        </SectionView>
        <SectionView id="props" className="py-24">
          <Projects />
        </SectionView>
        <SectionView id="commit" className="py-24">
          <CommitSection />
        </SectionView>
      </main>
      <Footer />
    </Providers>
  );
}
