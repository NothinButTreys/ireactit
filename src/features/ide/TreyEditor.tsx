import { useState } from 'react';
import { useBump } from '@/features/render-counter/RenderCounter';
import { CodeView } from './CodeView';
import { LivePreview } from './LivePreview';
import { PropControls } from './PropControls';
import { DEFAULT_TREY, treyReducer, type TreyAction } from './treyProps';
import { treySourceLines } from './treySource';

export function TreyEditor() {
  const [props, setProps] = useState(DEFAULT_TREY);
  const bump = useBump();

  function update(action: TreyAction) {
    const next = treyReducer(props, action);
    if (next === props) return;
    setProps(next);
    bump();
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[7fr_5fr]">
      <div className="flex min-w-0 flex-col border-border lg:border-r">
        <div className="flex h-11 items-end gap-0.5 border-b border-border px-3 font-mono text-xs">
          <span className="rounded-t-lg border border-b-0 border-border bg-bg px-3.5 py-2.5 text-fg">Trey.tsx</span>
          <span className="px-3.5 py-2.5 text-muted">engineer.types.ts</span>
        </div>
        <CodeView lines={treySourceLines(props)} />
        <PropControls value={props} onChange={update} />
      </div>
      <LivePreview value={props} />
    </div>
  );
}
