import { useCallback, useReducer } from 'react';
import { useBump } from '@/features/render-counter/RenderCounter';
import { commitReducer, initialCommit, postCommit, validateCommit, type Fields } from './commitForm';

export function useCommitForm() {
  const [state, dispatch] = useReducer(commitReducer, initialCommit);
  const bump = useBump();

  const edit = useCallback((field: keyof Fields, value: string) => dispatch({ type: 'edit', field, value }), []);

  async function submit() {
    if (state.status === 'sending') return;
    const errors = validateCommit(state.fields);
    if (errors) {
      dispatch({ type: 'invalid', errors });
      return;
    }
    dispatch({ type: 'send' });
    const result = await postCommit(state.fields);
    dispatch(result);
    if (result.type === 'delivered') bump();
  }

  return { state, edit, submit };
}
