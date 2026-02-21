import { pipeable, type Pipeable } from "~/pipe/implementation";

export interface Ok<T> extends Pipeable {
  _tag: "ok";
  value: T;
}

export interface Err<E> extends Pipeable {
  _tag: "err";
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

export function map<T1, T2>(onOk: (value: T1) => T2) {
  return function <E>(result: Result<T1, E>): Result<T2, E> {
    return result._tag === "ok" ? ok(onOk(result.value)) : result;
  };
}

export function mapErr<E1, E2>(onErr: (error: E1) => E2) {
  return function <T>(result: Result<T, E1>): Result<T, E2> {
    return result._tag === "ok" ? result : err(onErr(result.error));
  };
}

export function bimap<T1, E1, T2, E2>(func: { onOk: (value: T1) => T2; onErr: (error: E1) => E2 }) {
  return function (result: Result<T1, E1>): Result<T2, E2> {
    return result._tag === "ok" ? ok(func.onOk(result.value)) : err(func.onErr(result.error));
  };
}

export function flatMap<T1, E, T2>(onOk: (value: T1) => Result<T2, E>) {
  return function (result: Result<T1, E>) {
    return result._tag === "ok" ? onOk(result.value) : result;
  };
}

export function flatMapError<T, E1, E2>(onErr: (error: E1) => Result<T, E2>) {
  return function (result: Result<T, E1>) {
    return result._tag === "ok" ? result : onErr(result.error);
  };
}

export function biFlatMap<T1, E1, T2, E2>(func: {
  onOk: (value: T1) => Result<T2, E2>;
  onErr: (error: E1) => Result<T2, E2>;
}): (result: Result<T1, E1>) => Result<T2, E2> {
  return function (result: Result<T1, E1>) {
    return result._tag === "ok" ? func.onOk(result.value) : func.onErr(result.error);
  };
}
