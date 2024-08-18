//TODO: {} replace with form type

import { useContext } from 'react';
import { FormContext, FormState } from '../provider/Form';

type ContextStore<Selector, Store> = (
  selector?: (store: Store) => Selector
) => Selector;

export default function useFormStore<Selector = FormState>(
  selector?: (state: FormState) => Selector
) {
  const store = useContext(FormContext) as ContextStore<Selector, FormState>;

  if (typeof store !== 'function') {
    throw new Error('Missing provider wrapper for external store');
  }

  return store(selector);
}
