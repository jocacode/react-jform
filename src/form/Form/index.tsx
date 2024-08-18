import { ForwardedRef, forwardRef, ForwardRefRenderFunction } from 'react';
import { FormProvider } from '../provider/Form';
import Form, { FormProps } from './Form.component';

const FormWrapper: ForwardRefRenderFunction<HTMLFormElement, any> = <
  T extends Record<string, any>,
>(
  props: FormProps<T>,
  ref: ForwardedRef<HTMLFormElement>
) => {
  return (
    <FormProvider>
      <Form ref={ref} {...props} />
    </FormProvider>
  );
};

export default forwardRef(FormWrapper);
