import { useCallback, useReducer, useRef } from 'react';
import { useBump } from '@/features/render-counter/RenderCounter';
import { commitReducer, firstInvalidField, initialCommit, postCommit, validateCommit, type FieldName, type Fields } from './commitForm';

export function useCommitForm() {
  const [state, dispatch] = useReducer(commitReducer, initialCommit);
  const bump = useBump();
  const inFlight = useRef(false);

  const edit = useCallback((field: keyof Fields, value: string) => dispatch({ type: 'edit', field, value }), []);

  /** Resolves to the first invalid field name (so the caller can move focus there), or null on success. */
  async function submit(): Promise<FieldName | null> {
    if (state.status === 'sending' || inFlight.current) return null;
    const errors = validateCommit(state.fields);
    if (errors) {
      dispatch({ type: 'invalid', errors });
      return firstInvalidField(errors);
    }
    inFlight.current = true;
    try {
      dispatch({ type: 'send' });
      const result = await postCommit(state.fields);
      dispatch(result);
      if (result.type === 'delivered') bump();
      return result.type === 'invalid' ? firstInvalidField(result.errors) : null;
    } finally {
      inFlight.current = false;
    }
  }

  return { state, edit, submit };
}
