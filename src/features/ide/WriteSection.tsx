import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { TreyEditor } from './TreyEditor';

export function WriteSection() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader step="write" />
      <Reveal delay={120}>
        <TreyEditor />
      </Reveal>
    </div>
  );
}
