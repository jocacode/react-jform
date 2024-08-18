import { createContext } from 'react';
import { FormState } from './Form.provider';

export type FormStoreType = <Selector = FormState>(
  selector?: (state: FormState) => Selector
) => Selector;

export const FormContext = createContext<FormStoreType>({} as FormStoreType);
