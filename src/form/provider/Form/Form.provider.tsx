import { PropsWithChildren, useState } from 'react';
import { createStore, SetState } from 'react-jstore';
import { produce } from 'immer';

import { FormContext, FormStoreType } from './Form.context';
import { FieldValidator, FieldValues } from '../../Field/Field.component';

export type FormRecordKey<T, S = boolean> = Record<keyof T, S>;
export type ValidationType = 'change' | 'blur';

export type FormServices = {
  registerField: (key: string, validate: FieldValidator) => void;
  unregisterField: (key: string) => void;
  setValueField: (key: string, value: any) => void;
  setTouchedField: (key: string, value: boolean) => void;
  validateField: (
    key: string,
    validator: FieldValidator,
    validationType?: ValidationType
  ) => string | undefined;
  validateForm: () => boolean | Promise<boolean>;
};

export type FormState<T = any> = {
  valid: boolean;
  submitting: boolean;
  fields: FormRecordKey<T, FieldValues>;
  fieldRegistry: FormRecordKey<T, FieldValidator>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  //services
  services: FormServices;
};

function updateFormState<T, Value>(
  set: SetState<FormState<T>>,
  updatingObjectKey: keyof FieldValues,
  updatingKey: string,
  value: Value
) {
  set(
    (old) =>
      ({
        ...old,
        fields: {
          ...old.fields,
          [updatingKey]: {
            ...(old as any).fields[updatingKey],
            [updatingObjectKey]: value,
          } as FieldValues,
        },
      }) as FormState<T>
  );
}

const formService = <T extends Record<string, any>>(
  set: SetState<FormState<T>>,
  get: () => FormState<T>
): FormServices => {
  const setValueField = (key: string, value: any) => {
    updateFormState<T, any>(set, 'value', key, value);
  };

  const setTouchedField = (key: string, value: boolean) => {
    updateFormState<T, boolean>(set, 'touched', key, value);
  };

  const validateField = (key: string, validator: FieldValidator) => {
    const field = get().fields[key as keyof T] ?? {};
    const error = validator(field?.value, get()?.fields);

    updateFormState<T, boolean>(set, 'error', key, error);
    return error;
  };

  const validateForm = () => {
    Object.entries(get().fieldRegistry).forEach(async ([name, validator]) => {
      setTouchedField(name, true);
      await validateField(name, validator as FieldValidator);
    });

    const isValid = (Object.values(get().fields) as Array<FieldValues>).every(
      (field: FieldValues) => field.error === undefined
    );

    set(
      produce<FormState<T>>((draft) => {
        draft.valid = isValid;
      })
    );

    return isValid;
  };

  const registerField = (key: string, validate: FieldValidator) => {
    set(
      produce<FormState<T>>((draft) => {
        (draft as any).fieldRegistry[key] = validate;
      })
    );
  };

  const unregisterField = (key: string) => {
    set(
      produce<FormState<T>>((draft) => {
        delete (draft as any).fieldRegistry[key];
      })
    );
  };

  return {
    setValueField,
    setTouchedField,
    validateField,
    registerField,
    unregisterField,
    validateForm,
  } as FormServices;
};

export type FormProviderProps = PropsWithChildren<{
  initialData?: any;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}>;

export function FormProvider<T extends Record<string, any>>(
  props: FormProviderProps
) {
  const { children, validateOnBlur = true, validateOnChange = false } = props;

  const [formContextStore] = useState<FormStoreType>(
    () =>
      createStore<FormState<T>>((set, get) => ({
        //valid since last submit
        valid: true,
        submitting: false,
        validateOnBlur,
        validateOnChange,
        fields: {} as FormRecordKey<T, FieldValues>,
        fieldRegistry: {} as FormRecordKey<T, FieldValidator>,
        services: formService<T>(set, get),
      })) as FormStoreType
  );

  return (
    <FormContext.Provider value={formContextStore}>
      {children}
    </FormContext.Provider>
  );
}
