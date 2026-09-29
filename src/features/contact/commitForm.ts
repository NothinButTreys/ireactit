import { z } from 'zod';
import { contactSchema } from '@/lib/contactSchema';

export type Fields = { name: string; email: string; message: string; hp_url: string };
export type FieldName = 'name' | 'email' | 'message';
export type FieldErrors = Partial<Record<FieldName, string>>;
export type CommitStatus = 'idle' | 'sending' | 'delivered' | 'rejected';
export type RejectReason = 'rate_limited' | 'send_failed' | 'network';

export type CommitState = { status: CommitStatus; fields: Fields; errors: FieldErrors; reason?: RejectReason };

export type CommitAction =
  | { type: 'edit'; field: keyof Fields; value: string }
  | { type: 'invalid'; errors: FieldErrors }
  | { type: 'send' }
  | { type: 'delivered' }
  | { type: 'rejected'; reason: RejectReason };

export const initialCommit: CommitState = {
  status: 'idle',
  fields: { name: '', email: '', message: '', hp_url: '' },
  errors: {},
};

export function commitReducer(state: CommitState, action: CommitAction): CommitState {
  switch (action.type) {
    case 'edit': {
      const errors = Object.fromEntries(Object.entries(state.errors).filter(([key]) => key !== action.field));
      return {
        ...state,
        status: state.status === 'sending' ? 'sending' : 'idle',
        reason: undefined,
        fields: { ...state.fields, [action.field]: action.value },
        errors,
      };
    }
    case 'invalid':
      return { ...state, status: 'idle', errors: action.errors };
    case 'send':
      return { ...state, status: 'sending', errors: {}, reason: undefined };
    case 'delivered':
      return { ...initialCommit, status: 'delivered' };
    case 'rejected':
      return { ...state, status: 'rejected', reason: action.reason };
  }
}

const FIELD_NAMES: readonly FieldName[] = ['name', 'email', 'message'];

function firstErrors(fieldErrors: Record<string, string[] | undefined>): FieldErrors {
  const out: FieldErrors = {};
  for (const name of FIELD_NAMES) {
    const first = fieldErrors[name]?.[0];
    if (first) out[name] = first;
  }
  return out;
}

export function validateCommit(fields: Fields): FieldErrors | null {
  const parsed = contactSchema.safeParse(fields);
  if (parsed.success) return null;
  const errors = firstErrors(z.flattenError(parsed.error).fieldErrors);
  // Only visible fields can be shown and focused; a hidden-field (honeypot) failure is left for the server to judge.
  return Object.keys(errors).length > 0 ? errors : null;
}

/** The first invalid field, in name → email → message order (the order fields appear in the form). */
export function firstInvalidField(errors: FieldErrors): FieldName | null {
  return FIELD_NAMES.find((name) => errors[name]) ?? null;
}

type PostResult = Extract<CommitAction, { type: 'delivered' | 'invalid' | 'rejected' }>;

export async function postCommit(fields: Fields, fetchImpl: typeof fetch = fetch): Promise<PostResult> {
  let res: Response;
  try {
    res = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fields),
    });
  } catch {
    return { type: 'rejected', reason: 'network' };
  }
  if (res.ok) return { type: 'delivered' };
  if (res.status === 400) {
    const body: unknown = await res.json().catch(() => ({}));
    const fieldErrors =
      typeof body === 'object' && body !== null && 'fieldErrors' in body
        ? (body.fieldErrors as Record<string, string[] | undefined>)
        : {};
    const errors = firstErrors(fieldErrors);
    // A 400 with nothing to show on a visible field (malformed body, honeypot) must still tell the visitor it failed.
    return Object.keys(errors).length > 0 ? { type: 'invalid', errors } : { type: 'rejected', reason: 'send_failed' };
  }
  return { type: 'rejected', reason: res.status === 429 ? 'rate_limited' : 'send_failed' };
}
