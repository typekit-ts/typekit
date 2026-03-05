export type ListLike<T> = [] | readonly [] | T[] | readonly T[];

export type Head<T extends ListLike<unknown>> = T extends []
  ? never
  : T extends readonly []
    ? never
    : T extends [infer Head, ...unknown[]]
      ? Head
      : T extends readonly [infer Head, ...unknown[]]
        ? Head
        : never;

export type Tail<T extends ListLike<unknown>> = T extends []
  ? []
  : T extends readonly []
    ? readonly []
    : T extends [unknown]
      ? []
      : T extends readonly [unknown]
        ? []
        : T extends [unknown, ...infer Tail]
          ? Tail
          : T extends readonly [unknown, ...infer Tail]
            ? Tail
            : never;
