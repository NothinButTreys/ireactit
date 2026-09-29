import type { Project } from '@/content/types';
import { INSPECTOR_KEYS, nodeLabel, type InspectorKey } from './inspectorKeys';

type Props = { project: Project; selected: InspectorKey; onSelect: (key: InspectorKey) => void };

const label = (project: Project, key: InspectorKey) => (key === 'root' ? project.name : nodeLabel(key));

export function PropsPane({ project, selected, onSelect }: Props) {
  const index = INSPECTOR_KEYS.indexOf(selected);
  const prev = INSPECTOR_KEYS[index - 1];
  const next = INSPECTOR_KEYS[index + 1];

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-[11px] font-normal tracking-[0.08em] text-muted">PROPS</h3>
        <dl className="font-mono text-[13px] leading-6">
          <div>
            <dt className="tok-prop inline">stack</dt>
            <dd className="tok-str inline">
              <span className="tok-punct">: </span>[{project.stack.map((s) => `"${s}"`).join(', ')}]
            </dd>
          </div>
          {project.team && (
            <div>
              <dt className="tok-prop inline">team</dt>
              <dd className="tok-str inline">
                <span className="tok-punct">: </span>&quot;{project.team}&quot;
              </dd>
            </div>
          )}
          <div>
            <dt className="tok-prop inline">year</dt>
            <dd className="tok-str inline">
              <span className="tok-punct">: </span>&quot;{project.year}&quot;
            </dd>
          </div>
          <div>
            <dt className="tok-prop inline">links</dt>
            <dd className="inline">
              <span className="tok-punct">: </span>
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline md:min-h-0"
                >
                  {link.label} <span aria-hidden>↗</span> <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </section>
      <hr className="border-border" />
      {selected === 'root' ? (
        <p className="text-muted">Select a node in the tree to read that part of the story.</p>
      ) : (
        <section key={selected} className="mount-in flex flex-col gap-2.5">
          <h3 className="font-mono text-[11px] font-normal tracking-[0.08em] text-muted">
            STATE · <span className="tok-tag">&lt;{nodeLabel(selected)} /&gt;</span>
          </h3>
          <p className="text-base leading-[1.65]">{project.nodes[selected].body}</p>
        </section>
      )}
      <nav aria-label="Case study steps" className="mt-auto flex items-center justify-between gap-2 font-mono text-xs text-muted">
        {prev ? (
          <button type="button" onClick={() => onSelect(prev)} className="min-h-11 hover:text-fg md:min-h-6">
            ← {label(project, prev)}
          </button>
        ) : (
          <span />
        )}
        {index > 0 && (
          <span>
            {index} / {INSPECTOR_KEYS.length - 1}
          </span>
        )}
        {next ? (
          <button type="button" onClick={() => onSelect(next)} className="min-h-11 hover:text-fg md:min-h-6">
            {label(project, next)} →
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
