import { dual } from "~/dual";
import { Functions } from "~/functions";
import { HKT } from "~/hkt";
import { Pipe } from "~/pipe";
import { Result } from "~/result";
import { tagged } from "~/tagged";
import { Type } from "~/type";
import { TypeClass } from "~/typeclass";

export interface Some<T> extends Pipe.Pipeable {
  _tag: "some";
  value: T;
}

export interface None extends Pipe.Pipeable {
  _tag: "none";
}

export type Option<T> = Some<T> | None;

interface OptionHKT extends HKT.HKT {
  return: Option<HKT.Arg0<this>>;
}

const optionMonad: TypeClass.Monad<OptionHKT> = {
  pure: <T>(value: T) => Pipe.pipeable(tagged({ value }, "some")),
  ap: (option, f) => f(option),
  map: (option, onSome) => (option._tag === "some" ? optionMonad.pure(onSome(option.value)) : option),
  flatMap: (option, onSome) => (option._tag === "some" ? onSome(option.value) : option),
};

export const some = optionMonad.pure;

export function none<T>(): Option<T> {
  return Pipe.pipeable(tagged({}, "none"));
}

export function isSome<T>(option: Option<T>): option is Some<T> {
  return option._tag === "some";
}

export function isNone<T = never>(option: Option<T>): option is None {
  return option._tag === "none";
}

export const ap: {
  <T1, T2>(option: Option<T1>, apply: (option: Option<T1>) => Option<T2>): Option<T2>;
  <T1, T2>(apply: (option: Option<T1>) => Option<T2>): (option: Option<T1>) => Option<T2>;
} = dual(2, optionMonad.ap);

export const map: {
  <T1, T2>(option: Option<T1>, onSome: (value: T1) => T2): Option<T2>;
  <T1, T2>(onSome: (value: T1) => T2): (option: Option<T1>) => Option<T2>;
} = dual(2, optionMonad.map);

export const flatMap: {
  <T1, T2>(option: Option<T1>, onSome: (value: T1) => Option<T2>): Option<T2>;
  <T1, T2>(onSome: (value: T1) => Option<T2>): (option: Option<T1>) => Option<T2>;
} = dual(2, optionMonad.flatMap);

export function flatten<T>(option: Option<Option<T>>) {
  return option._tag === "some" ? option.value : option;
}

export const match: {
  <T, R1, R2 = never>(
    option: Option<T>,
    func: {
      isSome: (value: T) => R1;
      isNone: () => R2;
    },
  ): R1 | R2;
  <T, R1, R2 = never>(func: { isSome: (value: T) => R1; isNone: () => R2 }): (option: Option<T>) => R1 | R2;
} = dual(
  2,
  function <T, R1, R2 = never>(
    option: Option<T>,
    func: {
      isSome: (value: T) => R1;
      isNone: () => R2;
    },
  ): R1 | R2 {
    return option._tag === "some" ? func.isSome(option.value) : func.isNone();
  },
);

export function fromNullable<T = unknown>(nullable: Type.Nullable<T>): Option<Type.RemoveNull<T>> {
  return Functions.isNotNull(nullable) ? some(nullable) : none();
}

export function fromOptional<T = unknown>(optional: Type.Optional<T>): Option<Type.RemoveUndefined<T>> {
  return Functions.isNotUndefined(optional) ? some(optional) : none();
}

export function fromNullableOptional<T = unknown>(
  nullableOptional: T | null | undefined,
): Option<Type.RemoveNullOrUndefined<T>> {
  return Functions.isNotNullOrUndefined(nullableOptional) ? some(nullableOptional) : none();
}

export const toResult: {
  <T, E = unknown>(option: Option<T>, error: E): Result.Result<T, E>;
  <E = unknown>(error: E): <T>(option: Option<T>) => Result.Result<T, E>;
} = dual(2, function <T, E = unknown>(option: Option<T>, error: E): Result.Result<T, E> {
  return option._tag === "some" ? Result.ok(option.value) : Result.err(error);
});

export function fromResult<T, E>(result: Result.Result<T, E>): Option<T> {
  return Result.isOk(result) ? some(result.value) : none();
}
