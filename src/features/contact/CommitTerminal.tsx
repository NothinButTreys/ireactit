import { useId, useRef, type KeyboardEvent } from 'react';
import { profile } from '@/content/profile';
import type { CommitState, RejectReason } from './commitForm';
import { useCommitForm } from './useCommitForm';

const REASONS: Record<RejectReason, string> = {
  rate_limited: 'too many pushes — try again in a few minutes',
  send_failed: 'the mail server hiccupped',
  network: 'network unreachable',
};

// Focus-visible ring comes from the global base rule (2px solid, 3px offset); no per-element override needed.
const inputClass = 'min-w-0 flex-1 border-0 bg-transparent font-mono text-[15px] text-fg placeholder:text-muted/70 aria-[invalid=true]:text-danger';

function PushLog({ state }: { state: CommitState }) {
  const pushed = state.status === 'sending' || state.status === 'delivered';
  return (
    <div role="status" aria-live="polite" className="mt-auto border-t border-border bg-bg px-6 py-4 font-mono text-[13px] leading-[22px] text-muted">
      {state.status === 'idle' && <p>$ waiting for your commit…</p>}
      {pushed && (
        <>
          <p>Enumerating objects: 1, done.</p>
          <p>Writing objects: 100% (1/1)</p>
          <p>To ireactit.com</p>
        </>
      )}
      {state.status === 'delivered' && <p className="text-success"> ✓ delivered to trey/main — I&apos;ll reply within a day or two.</p>}
      {state.status === 'rejected' && (
        <>
          <p className="text-danger">✗ push rejected: {REASONS[state.reason ?? 'send_failed']}</p>
          <p>
            Your message is still here. Try again, or reach me on{' '}
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              LinkedIn ↗
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}

export function CommitTerminal() {
  const { state, edit, submit } = useCommitForm();
  const id = useId();
  const sending = state.status === 'sending';

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef };

  async function handleSubmit() {
    const invalidField = await submit();
    if (invalidField) fieldRefs[invalidField].current?.focus();
  }

  function onMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const field = (name: 'name' | 'email' | 'message') => ({
    id: `${id}-${name}`,
    name,
    value: state.fields[name],
    'aria-invalid': state.errors[name] ? true : undefined,
    'aria-describedby': state.errors[name] ? `${id}-${name}-error` : undefined,
  });

  const error = (name: 'name' | 'email' | 'message') =>
    state.errors[name] && (
      <p id={`${id}-${name}-error`} className="pb-1 pl-[108px] font-mono text-xs text-danger">
        {state.errors[name]}
      </p>
    );

  return (
    <form
      noValidate
      aria-label="Contact form"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <p id={`${id}-title`} className="flex h-11 items-center border-b border-border px-5 font-mono text-xs text-muted">
        trey@ireactit: ~/inbox
      </p>
      <div className="flex flex-col px-6 py-5">
        <p aria-hidden className="pb-2 font-mono text-[15px]">
          <span className="text-success">$</span> git commit <span className="text-muted">\</span>
        </p>

        <div className="flex items-center gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-name`} className="w-24 shrink-0 font-mono text-sm text-accent">
            --author <span className="sr-only">(your name)</span>
          </label>
          <input
            {...field('name')}
            ref={nameRef}
            autoComplete="name"
            placeholder="Ada Lovelace"
            onChange={(e) => edit('name', e.target.value)}
            className={`${inputClass} h-11 md:h-7`}
          />
        </div>
        {error('name')}

        <div className="flex items-center gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-email`} className="w-24 shrink-0 font-mono text-sm text-accent">
            --email <span className="sr-only">(your email)</span>
          </label>
          <input
            {...field('email')}
            ref={emailRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ada@example.com"
            onChange={(e) => edit('email', e.target.value)}
            className={`${inputClass} h-11 md:h-7`}
          />
        </div>
        {error('email')}

        <div className="flex items-start gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-message`} className="w-24 shrink-0 pt-0.5 font-mono text-sm text-accent">
            -m <span className="sr-only">(your message)</span>
          </label>
          <textarea
            {...field('message')}
            ref={messageRef}
            rows={3}
            placeholder="Loved the render cycle. Want to talk?"
            onChange={(e) => edit('message', e.target.value)}
            onKeyDown={onMessageKeyDown}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </div>
        {error('message')}

        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input name="company" tabIndex={-1} autoComplete="off" value={state.fields.company} onChange={(e) => edit('company', e.target.value)} />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-5">
          <span className="hidden font-mono text-xs text-muted sm:inline">⌘⏎ to push · replies go to your email</span>
          <button
            type="submit"
            disabled={sending}
            className="h-12 rounded-[10px] bg-primary px-[22px] font-mono text-sm font-bold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            git push
          </button>
        </div>
      </div>
      <PushLog state={state} />
    </form>
  );
}
