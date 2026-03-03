import { dual } from "~/dual";
import type { HKT } from "~/hkt";
import { type Pipeable, pipeable } from "~/pipe";
import { Tagged, tagged } from "~/tagged";
import type { TypeClass } from "~/typeclass";

export interface Ok<T> extends Tagged.Tagged<"ok">, Pipeable {
  value: T;
}

export interface Err<E> extends Tagged.Tagged<"err">, Pipeable {
  error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T = unknown, E = never>(value: T): Result<T, E> {
  return pipeable(
    tagged(
      {
        value,
      },
      "ok",
    ),
  );
}

export function err<T = never, E = unknown>(error: E): Result<T, E> {
  return pipeable(
    tagged(
      {
        error,
      },
      "err",
    ),
  );
}

interface ResultHKT extends HKT.HKT2 {
  return: Result<HKT.Arg0<this>, HKT.Arg1<this>>;
}

const resultMonad: TypeClass.Monad2<ResultHKT> = {
  pureLeft: (value) => pipeable(tagged({ value }, "ok")),
  pureRight: (error) => pipeable(tagged({ error }, "err")),
  mapLeft: (result, onOk) => (result._tag === "ok" ? resultMonad.pureLeft(onOk(result.value)) : result),
  mapRight: (result, onErr) => (result._tag === "ok" ? result : resultMonad.pureRight(onErr(result.error))),
  biMap: (result, func) =>
    result._tag === "ok"
      ? resultMonad.pureLeft(func.onLeft(result.value))
      : resultMonad.pureRight(func.onRight(result.error)),
  apLeft: (result, onOk) => (result._tag === "ok" ? onOk(result) : result),
  apRight: (result, onErr) => (result._tag === "ok" ? result : onErr(result)),
  biAp: (result, func) => (result._tag === "ok" ? func.onLeft(result) : func.onRight(result)),
  flatMapLeft: (result, onOk) => (result._tag === "ok" ? onOk(result.value) : result),
  flatMapRight: (result, onErr) => (result._tag === "ok" ? result : onErr(result.error)),
  biFlatMap: (result, func) => (result._tag === "ok" ? func.onLeft(result.value) : func.onRight(result.error)),
};

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result._tag === "ok";
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result._tag === "err";
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result._tag === "err") {
    throw new Error(`Cannot unwrap Err value: ${String(result.error)}`);
  }

  return result.value;
}

export const unwrapOr: {
  <T, E>(result: Result<T, E>, defaultValue: T): T;
  <T>(defaultValue: T): <E>(result: Result<T, E>) => T;
} = dual(2, function <T, E>(result: Result<T, E>, defaultValue: T) {
  return result._tag === "ok" ? result.value : defaultValue;
});

export function unwrapErr<T, E>(result: Result<T, E>): E {
  if (result._tag === "ok") {
    throw new Error(`Cannot unwrapErr Ok value: ${String(result.value)}`);
  }

  return result.error;
}

export const unwrapErrOr: {
  <T, E>(result: Result<T, E>, defaultError: E): E;
  <E>(defaultError: E): <T>(result: Result<T, E>) => E;
} = dual(2, function <T, E>(result: Result<T, E>, defaultError: E): E {
  return result._tag === "ok" ? defaultError : result.error;
});

export const expect: {
  <T, E>(result: Result<T, E>, message: string): T;
  (message: string): <T, E>(result: Result<T, E>) => T;
} = dual(2, function <T, E>(result: Result<T, E>, message: string): T {
  if (result._tag === "err") {
    throw new Error(message);
  }

  return result.value;
});

export function flatten<T, E1, E2 = E1>(result: Result<Result<T, E1>, E2>): Result<T, E1 | E2> {
  if (result._tag === "err") {
    return err(result.error);
  }

  return result.value._tag === "ok" ? ok(result.value.value) : err(result.value.error);
}

export const map: {
  <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => T2): Result<T2, E>;
  <T1, T2>(onOk: (value: T1) => T2): <E>(result: Result<T1, E>) => Result<T2, E>;
} = dual(2, resultMonad.mapLeft);

export const mapErr: {
  <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => E2): Result<T, E2>;
  <E1, E2>(onErr: (error: E1) => E2): <T>(result: Result<T, E1>) => Result<T, E2>;
} = dual(2, resultMonad.mapRight);

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
    return resultMonad.biMap(result, { onLeft: func.onOk, onRight: func.onErr });
  },
);

export const ap: {
  <T1, E, T2>(result: Result<T1, E>, onOk: (result: Result<T1, E>) => Result<T2, E>): Result<T2, E>;
  <T1, E, T2>(onOk: (result: Result<T1, E>) => Result<T2, E>): (result: Result<T1, E>) => Result<T2, E>;
} = dual(2, resultMonad.apLeft);

export const apErr: {
  <T, E1, E2>(result: Result<T, E1>, onErr: (result: Result<T, E1>) => Result<T, E2>): Result<T, E2>;
  <T, E1, E2>(onErr: (result: Result<T, E1>) => Result<T, E2>): (result: Result<T, E1>) => Result<T, E2>;
} = dual(2, resultMonad.apRight);

export const biAp: {
  <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (result: Result<T1, E1>) => Result<T2, E2>;
      onErr: (result: Result<T1, E1>) => Result<T2, E2>;
    },
  ): Result<T2, E2>;
  <T1, E1, T2, E2>(func: {
    onOk: (result: Result<T1, E1>) => Result<T2, E2>;
    onErr: (result: Result<T1, E1>) => Result<T2, E2>;
  }): (result: Result<T1, E1>) => Result<T2, E2>;
} = dual(
  2,
  function <T1, E1, T2, E2>(
    result: Result<T1, E1>,
    func: {
      onOk: (result: Result<T1, E1>) => Result<T2, E2>;
      onErr: (result: Result<T1, E1>) => Result<T2, E2>;
    },
  ): Result<T2, E2> {
    return resultMonad.biAp(result, {
      onLeft: func.onOk,
      onRight: func.onErr,
    });
  },
);

export const flatMap: {
  <T1, E, T2>(result: Result<T1, E>, onOk: (value: T1) => Result<T2, E>): Result<T2, E>;
  <T1, E, T2>(onOk: (value: T1) => Result<T2, E>): (result: Result<T1, E>) => Result<T2, E>;
} = dual(2, resultMonad.flatMapLeft);

export const flatMapErr: {
  <T, E1, E2>(result: Result<T, E1>, onErr: (error: E1) => Result<T, E2>): Result<T, E2>;
  <T, E1, E2>(onErr: (error: E1) => Result<T, E2>): (result: Result<T, E1>) => Result<T, E2>;
} = dual(2, resultMonad.flatMapRight);

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
    return resultMonad.biFlatMap(result, { onLeft: func.onOk, onRight: func.onErr });
  },
);

export const match: {
  <T, E, R1, R2 = never>(
    result: Result<T, E>,
    func: {
      onOk: (value: T) => R1;
      onErr: (error: E) => R2;
    },
  ): R1 | R2;
  <T, E, R1, R2 = never>(func: { onOk: (value: T) => R1; onErr: (error: E) => R2 }): (result: Result<T, E>) => R1 | R2;
} = dual(
  2,
  function <T, E, R1, R2 = never>(
    result: Result<T, E>,
    func: {
      onOk: (value: T) => R1;
      onErr: (error: E) => R2;
    },
  ): R1 | R2 {
    return result._tag === "ok" ? func.onOk(result.value) : func.onErr(result.error);
  },
);
