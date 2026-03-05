export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type NullableOptional<T> = T | null | undefined;

export type RemoveNull<T> = Exclude<T, null>;

export type RemoveUndefined<T> = Exclude<T, undefined>;

export type RemoveNullOrUndefined<T> = NonNullable<T>;
