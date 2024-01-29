export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonNull<T> = Prettify<{
  [P in keyof T]: NonNullable<T[P]>;
}>;
