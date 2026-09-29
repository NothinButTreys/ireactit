import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { useCommitForm } from './useCommitForm';

const wrapper = ({ children }: { children: ReactNode }) => <RenderCounterProvider>{children}</RenderCounterProvider>;

describe('useCommitForm', () => {
  it('guards against two rapid submits posting twice', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useCommitForm(), { wrapper });
    act(() => {
      result.current.edit('name', 'Ada Lovelace');
      result.current.edit('email', 'ada@example.com');
      result.current.edit('message', 'Loved the render cycle!');
    });

    await act(async () => {
      // Two submits fired back-to-back, synchronously, before either resolves.
      await Promise.all([result.current.submit(), result.current.submit()]);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
