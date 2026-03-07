import { dual } from "~/dual";
import { HKT } from "~/hkt";
import { Pipe } from "~/pipe";
import { Tagged } from "~/tagged";
import { TypeClass } from "~/typeclass";

export interface Left<L> extends Tagged.Tagged<"left">, Pipe.Pipeable {
  left: L;
}

export interface Right<R> extends Tagged.Tagged<"right">, Pipe.Pipeable {
  right: R;
}

export type Either<L, R> = Left<L> | Right<R>;

interface EitherHKT extends HKT.HKT2 {
  return: Either<HKT.Arg0<this>, HKT.Arg1<this>>;
}

const eitherMonad: TypeClass.Monad2<EitherHKT> = {
  pureLeft: (left) => Pipe.pipeable(Tagged.tagged({ left }, "left")),
  pureRight: (right) => Pipe.pipeable(Tagged.tagged({ right }, "right")),
  mapLeft: (either, onLeft) => (either._tag === "left" ? eitherMonad.pureLeft(onLeft(either.left)) : either),
  mapRight: (either, onRight) => (either._tag === "left" ? either : eitherMonad.pureRight(onRight(either.right))),
  biMap: (result, func) =>
    result._tag === "left"
      ? eitherMonad.pureLeft(func.onLeft(result.left))
      : eitherMonad.pureRight(func.onRight(result.right)),
  apLeft: (result, onLeft) => (result._tag === "left" ? onLeft(result) : result),
  apRight: (result, onRight) => (result._tag === "left" ? result : onRight(result)),
  biAp: (result, func) => (result._tag === "left" ? func.onLeft(result) : func.onRight(result)),
  flatMapLeft: (result, onLeft) => (result._tag === "left" ? onLeft(result.left) : result),
  flatMapRight: (result, onRight) => (result._tag === "left" ? result : onRight(result.right)),
  biFlatMap: (result, func) => (result._tag === "left" ? func.onLeft(result.left) : func.onRight(result.right)),
};

export const left = eitherMonad.pureLeft;

export const right = eitherMonad.pureRight;

export function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either._tag === "left";
}

export function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either._tag === "right";
}

export function unwrapLeft<L, R>(either: Either<L, R>): L {
  if (either._tag === "right") {
    throw new Error(`Cannot unwrapLeft right value: ${String(either.right)}`);
  }

  return either.left;
}

export const unwrapLeftOr: {
  <L, R>(either: Either<L, R>, defaultValue: L): L;
  <L>(defaultValue: L): <R>(either: Either<L, R>) => L;
} = dual(2, function <L, R>(either: Either<L, R>, defaultValue: L): L {
  return either._tag === "left" ? either.left : defaultValue;
});

export function unwrapRight<L, R>(either: Either<L, R>): R {
  if (either._tag === "left") {
    throw new Error(`Cannot unwrapRight left value: ${String(either.left)}`);
  }

  return either.right;
}

export const unwrapRightOr: {
  <L, R>(either: Either<L, R>, defaultValue: R): R;
  <R>(defaultValue: R): <L>(either: Either<L, R>) => R;
} = dual(2, function <L, R>(either: Either<L, R>, defaultValue: R): R {
  return either._tag === "left" ? defaultValue : either.right;
});

// export function flattenLeft<L, R>(either: Either<Either<L, R>, R>) {
//   return either._tag === "left" ? either.left : either;
// }

export function flatten<L, R>(either: Either<L, Either<L, R>>): Either<L, R> {
  return either._tag === "left" ? either : either.right;
}

export function flatten2<L, R>(either: Either<Either<L, R>, Either<L, R>>): Either<L, R> {
  return either._tag === "left" ? either.left : either.right;
}

export const mapLeft: {
  <L1, R, L2>(either: Either<L1, R>, onLeft: (value: L1) => L2): Either<L2, R>;
  <L1, L2>(onLeft: (value: L1) => L2): <R>(either: Either<L1, R>) => Either<L2, R>;
} = dual(2, eitherMonad.mapLeft);

export const mapRight: {
  <L, R1, R2>(either: Either<L, R1>, onRight: (value: R1) => R2): Either<L, R2>;
  <R1, R2>(onRight: (value: R1) => R2): <L>(either: Either<L, R1>) => Either<L, R2>;
} = dual(2, eitherMonad.mapRight);

export const biMap: {
  <L1, R1, L2, R2>(
    either: Either<L1, R1>,
    func: {
      onLeft: (value: L1) => L2;
      onRight: (value: R1) => R2;
    },
  ): Either<L2, R2>;
  <L1, R1, L2, R2>(func: {
    onLeft: (value: L1) => L2;
    onRight: (value: R1) => R2;
  }): (either: Either<L1, R1>) => Either<L2, R2>;
} = dual(2, eitherMonad.biMap);

export const apLeft: {
  <L1, R, L2>(either: Either<L1, R>, onLeft: (either: Either<L1, R>) => Either<L2, R>): Either<L2, R>;
  <L1, R, L2>(onLeft: (either: Either<L1, R>) => Either<L2, R>): (either: Either<L1, R>) => Either<L2, R>;
} = dual(2, eitherMonad.apLeft);

export const apRight: {
  <L, R1, R2>(either: Either<L, R1>, onRight: (either: Either<L, R1>) => Either<L, R2>): Either<L, R2>;
  <L, R1, R2>(onRight: (either: Either<L, R1>) => Either<L, R2>): (either: Either<L, R1>) => Either<L, R2>;
} = dual(2, eitherMonad.apRight);

export const biAp: {
  <L1, R1, L2, R2>(
    either: Either<L1, R1>,
    func: {
      onLeft: (either: Either<L1, R1>) => Either<L2, R2>;
      onRight: (either: Either<L1, R1>) => Either<L2, R2>;
    },
  ): Either<L2, R2>;
  <L1, R1, L2, R2>(func: {
    onLeft: (either: Either<L1, R1>) => Either<L2, R2>;
    onRight: (either: Either<L1, R1>) => Either<L2, R2>;
  }): (either: Either<L1, R1>) => Either<L2, R2>;
} = dual(2, eitherMonad.biAp);

export const flatMapLeft: {
  <L1, R, L2>(either: Either<L1, R>, onLeft: (value: L1) => Either<L2, R>): Either<L2, R>;
  <L1, R, L2>(onLeft: (value: L1) => Either<L2, R>): (either: Either<L1, R>) => Either<L2, R>;
} = dual(2, eitherMonad.flatMapLeft);

export const flatMapRight: {
  <L, R1, R2>(either: Either<L, R1>, onRight: (value: R1) => Either<L, R2>): Either<L, R2>;
  <L, R1, R2>(onRight: (value: R1) => Either<L, R2>): (either: Either<L, R1>) => Either<L, R2>;
} = dual(2, eitherMonad.flatMapRight);

export const biFlatMap: {
  <L1, R1, L2, R2>(
    either: Either<L1, R1>,
    func: {
      onLeft: (value: L1) => Either<L2, R2>;
      onRight: (value: R1) => Either<L2, R2>;
    },
  ): Either<L2, R2>;
  <L1, R1, L2, R2>(func: {
    onLeft: (value: L1) => Either<L2, R2>;
    onRight: (value: R1) => Either<L2, R2>;
  }): (either: Either<L1, R1>) => Either<L2, R2>;
} = dual(2, eitherMonad.biFlatMap);
