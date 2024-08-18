import React, {
  useMemo,
  FocusEvent,
  ComponentClass,
  FunctionComponent,
  useEffect,
  FC,
} from 'react';

import useFormStore from '../hooks/useFormStore';

type ExtractComponentProps<T> = T extends React.FC<infer P> ? P : never;

export type FieldInputProps<FieldValue = unknown> = {
  name: string;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  onBlur: (event: FocusEvent) => void;
};
export type FieldMetaProps = {
  touched: boolean;
  dirty: boolean;
  error: string;
};

export type FieldValues<Value = any> = Pick<
  FieldInputProps<Value>,
  'name' | 'value'
> &
  FieldMetaProps;

export type FieldRenderProps<FieldValue> = {
  input: FieldInputProps<FieldValue>;
  meta: FieldMetaProps;
};

export type FieldValidator<FieldValue = any> = (
  value: FieldValue,
  allValues?: Record<string, any>
) => any | Promise<any>;

export type FieldProps<FieldValue> = {
  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  name: string;
  children?:
    | ((props: FieldRenderProps<FieldValue>) => React.ReactNode)
    | React.ReactNode;
  component: FunctionComponent<any> | ComponentClass<any> | string;
  initialValue?: FieldValue;
  validate?: FieldValidator<FieldValue>;
};

function Field<FieldValue = Record<string, any>>(
  props: FieldProps<FieldValue>
) {
  const {
    name,
    children,
    component: pComponent,
    initialValue,
    validate,
    ...rest
  } = props;

  const fieldValue = useFormStore(
    (s) => (s.fields as Record<string, FieldValues<FieldValue>>)[name]
  );

  const validateOnBlur = useFormStore((s) => s.validateOnBlur);
  const validateOnChange = useFormStore((s) => s.validateOnChange);

  const {
    setTouchedField,
    setValueField,
    registerField,
    unregisterField,
    validateField,
  } = useFormStore((store) => store.services);

  const { value, touched, dirty, error } = fieldValue ?? {};

  const inputProps = useMemo(
    () =>
      ({
        name,
        value: value || initialValue || '',
        onChange: (value: FieldValue) => {
          setValueField(name, value);

          if (validate && validateOnChange) {
            validateField(name, validate, 'change');
          }
        },
        onBlur: () => {
          setTouchedField(name, true);

          if (validate && validateOnBlur) {
            validateField(name, validate, 'blur');
          }
        },
      }) as FieldInputProps<FieldValue>,
    [name, fieldValue, initialValue]
  );

  const metaProps = useMemo(
    () => ({ error, touched, dirty }) as FieldMetaProps,
    [error, touched, dirty]
  );

  const component = useMemo(
    () =>
      React.createElement<
        FieldRenderProps<FieldValue> & ExtractComponentProps<typeof pComponent>
      >(
        pComponent,
        {
          input: inputProps,
          meta: metaProps,
          ...rest,
        },
        children as React.ReactNode[]
      ),
    [inputProps, metaProps, pComponent]
  );

  //register field with validate function
  //and unregister when field is unmounted
  useEffect(() => {
    if (name && validate) {
      registerField(name, validate);
    }

    return () => {
      if (name && validate) {
        unregisterField(name);
      }
    };
  }, [name, validate, registerField, unregisterField]);

  return component;
}

export default Field as FC;
