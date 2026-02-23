import { dual } from "~/dual";
import { pipeable, type Pipeable } from "~/pipe/implementation";
import type { Tagged } from "~/tagged/implementation";

export interface Ok<T> extends Tagged<"ok">, Pipeable {
  value: T;
}

export interface Err<E> extends Tagged<"err">, Pipeable {
  error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T = unknown, E = never>(value: T): Result<T, E> {
  return pipeable({
    _tag: "ok",
    value,
  });
}

export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return pipeable({
    _tag: "err",
    error,
  });
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result._tag === "ok";
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result._tag === "err";
}

export function unwrap<T, E>(result: Result<T, E>) {
  if (result._tag === "err") {
    throw new Error(`Cannot unwrap Err value: ${result}`);
  }

  return result.value;
}

export const unwrapOr: {
  <T, E>(result: Result<T, E>, defaultValue: T): T;
  <T>(defaultValue: T): <E>(result: Result<T, E>) => T;
} = dual(2, function <T, E>(result: Result<T, E>, defaultValue: T) {
  return result._tag === "ok" ? result.value : defaultValue;
});

export function unwrapErr<T, E>(result: Result<T, E>) {
  if (result._tag === "ok") {
    throw new Error(`Cannot unwrapErr Ok value: ${result}`);
  }

  return result.error;
}

export const unwrapErrOr: {
  <T, E>(result: Result<T, E>, defaultError: E): E;
  <E>(defaultError: E): <T>(result: Result<T, E>) => E;
} = dual(2, function <T, E>(result: Result<T, E>, defaultError: E) {
  return result._tag === "ok" ? defaultError : result.error;
});

export function flatten<T, E>(result: Result<Result<T, E>, E>) {
  return result._tag === "ok" ? result.value : result;
}

export const map: {
  <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => T2): Result<T2, E>;
  <T1, T2>(onOk: (value: T1) => T2): <E>(result: Result<T1, E>) => Result<T2, E>;
} = dual(2, function <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => T2): Result<T2, E> {
  return result._tag === "ok" ? ok(onOk(result.value)) : result;
});

export const mapErr: {
  <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => E2): Result<T, E2>;
  <E1, E2>(onErr: (error: E1) => E2): <T>(result: Result<T, E1>) => Result<T, E2>;
} = dual(2, function <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => E2): Result<T, E2> {
  return result._tag === "ok" ? result : err(onErr(result.error));
});

export const biMap: {
  <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (value: T1) => T2;
      onErr: (error: E1) => E2;
    },
  ): Result<T2, E2>;
  <T1, E1, T2, E2>(func: {
    onOk: (value: T1) => T2;
    onErr: (error: E1) => E2;
  }): (result: Result<T1, E1>) => Result<T2, E2>;
} = dual(
  2,
  function <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (value: T1) => T2;
      onErr: (error: E1) => E2;
    },
  ) {
    return result._tag === "ok" ? ok(func.onOk(result.value)) : err(func.onErr(result.error));
  },
);

export const flatMap: {
  <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => Result<T2, E>): Result<T2, E>;
  <T1, E, T2>(onOk: (value: T1) => Result<T2, E>): (result: Result<T1, E>) => Result<T2, E>;
} = dual(2, function <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => Result<T2, E>) {
  return result._tag === "ok" ? onOk(result.value) : result;
});

export const flatMapErr: {
  <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => Result<T, E2>): Result<T, E2>;
  <T, E1, E2>(onErr: (error: E1) => Result<T, E2>): (result: Result<T, E1>) => Result<T, E2>;
} = dual(2, function <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => Result<T, E2>) {
  return result._tag === "ok" ? result : onErr(result.error);
});

export const biFlatMap: {
  <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (value: T1) => Result<T2, E2>;
      onErr: (error: E1) => Result<T2, E2>;
    },
  ): Result<T2, E2>;
  <T1, E1, T2, E2>(func: {
    onOk: (value: T1) => Result<T2, E2>;
    onErr: (error: E1) => Result<T2, E2>;
  }): (result: Result<T1, E1>) => Result<T2, E2>;
} = dual(
  2,
  function <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (value: T1) => Result<T2, E2>;
      onErr: (error: E1) => Result<T2, E2>;
    },
  ) {
    return result._tag === "ok" ? func.onOk(result.value) : func.onErr(result.error);
  },
);
