export enum FieldType {
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  Text = 'text',
  Number = 'number',
  TextArea = 'textArea',
  Select = 'select',
  File = 'file',
}

export type dynamicSchema<T extends string[]> = {
  [k in T[number]]: string;
};

export type fieldUnion =
  | 'email'
  | 'phoneNumber'
  | 'text'
  | 'number'
  | 'textArea'
  | 'select'
  | 'file'
  | 'multiple_choice';
