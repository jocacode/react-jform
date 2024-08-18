import {
  FormEvent,
  ForwardedRef,
  forwardRef,
  ForwardRefRenderFunction,
  PropsWithChildren,
  useCallback,
} from 'react';

import useFormStore from '../hooks/useFormStore';
import { FieldValues } from '../Field/Field.component';

export type FormProps<T extends Record<string, any> = any> = PropsWithChildren<
  {
    initialData: T;
    onSubmit: (data: T) => void | Promise<void>;
  } & React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >
>;

const Form: ForwardRefRenderFunction<HTMLFormElement, FormProps> = <
  T extends Record<string, any>,
>(
  props: FormProps<T>,
  ref: ForwardedRef<HTMLFormElement>
) => {
  const { children, onSubmit, ...rest } = props;

  const fields = useFormStore((store) => store.fields);
  const { validateForm } = useFormStore((store) => store.services);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      //validate all form field withing field
      //registry validation functions
      if (!(await validateForm())) return;

      const formData = Object.entries(fields).reduce((prev, [key, field]) => {
        return { ...prev, [key]: (field as FieldValues).value };
      }, {} as T);

      await onSubmit?.(formData);
    },
    [fields, onSubmit, validateForm]
  );

  return (
    <form ref={ref} onSubmit={handleSubmit} {...rest}>
      {children}
    </form>
  );
};

export default forwardRef(Form);
