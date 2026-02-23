import { dual } from "~/dual";
import { Pipe, pipeable } from "~/pipe";
import { tagged, Tagged } from "~/tagged";

export interface Left<LeftType> extends Tagged.Tagged<"left">, Pipe.Pipeable {
  left: LeftType;
}

export interface Right<RightType> extends Tagged.Tagged<"right">, Pipe.Pipeable {
  right: RightType;
}

export type Either<LeftType, RightType> = Left<LeftType> | Right<RightType>;

export function left<LeftType = unknown, RightType = never>(value: LeftType): Either<LeftType, RightType> {
  return pipeable(tagged({ left: value }, "left"));
}

export function right<LeftType = never, RightType = unknown>(value: RightType): Either<LeftType, RightType> {
  return pipeable(tagged({ right: value }, "right"));
}

export function isLeft<LeftType, RightType>(either: Either<LeftType, RightType>): either is Left<LeftType> {
  return either._tag === "left";
}

export function isRight<LeftType, RightType>(either: Either<LeftType, RightType>): either is Right<RightType> {
  return either._tag === "right";
}

export function unwrapLeft<LeftType, RightType>(either: Either<LeftType, RightType>): LeftType {
  if (either._tag === "right") {
    throw new Error(`Cannot unwrapLeft right value: ${either}`);
  }

  return either.left;
}

export const unwrapLeftOr: {
  <LeftType, RightType>(either: Either<LeftType, RightType>, defaultValue: LeftType): LeftType;
  <LeftType>(defaultValue: LeftType): <RightType>(either: Either<LeftType, RightType>) => LeftType;
} = dual(2, function <LeftType, RightType>(either: Either<LeftType, RightType>, defaultValue: LeftType): LeftType {
  return either._tag === "left" ? either.left : defaultValue;
});

export function unwrapRight<LeftType, RightType>(either: Either<LeftType, RightType>): RightType {
  if (either._tag === "left") {
    throw new Error(`Cannot unwrapRight left value: ${either}`);
  }

  return either.right;
}

export const unwrapRightOr: {
  <LeftType, RightType>(either: Either<LeftType, RightType>, defaultValue: RightType): RightType;
  <RightType>(defaultValue: RightType): <LeftType>(either: Either<LeftType, RightType>) => RightType;
} = dual(2, function <LeftType, RightType>(either: Either<LeftType, RightType>, defaultValue: RightType): RightType {
  return either._tag === "left" ? defaultValue : either.right;
});

// export function flattenLeft<LeftType, RightType>(either: Either<Either<LeftType, RightType>, RightType>) {
//   return either._tag === "left" ? either.left : either;
// }

export function flatten<LeftType, RightType>(
  either: Either<LeftType, Either<LeftType, RightType>>,
): Either<LeftType, RightType> {
  return either._tag === "left" ? either : either.right;
}

export function flatten2<LeftType, RightType>(
  either: Either<Either<LeftType, RightType>, Either<LeftType, RightType>>,
): Either<LeftType, RightType> {
  return either._tag === "left" ? either.left : either.right;
}

export const mapLeft: {
  <LeftType1, RightType, LeftType2>(
    either: Either<LeftType1, RightType>,
    onLeft: (value: LeftType1) => LeftType2,
  ): Either<LeftType2, RightType>;
  <LeftType1, LeftType2>(
    onLeft: (value: LeftType1) => LeftType2,
  ): <RightType>(either: Either<LeftType1, RightType>) => Either<LeftType2, RightType>;
} = dual(2, function <
  LeftType1,
  RightType,
  LeftType2,
>(either: Either<LeftType1, RightType>, onLeft: (value: LeftType1) => LeftType2): Either<LeftType2, RightType> {
  return either._tag === "left" ? left(onLeft(either.left)) : either;
});

export const mapRight: {
  <LeftType, RightType1, RightType2>(
    either: Either<LeftType, RightType1>,
    onRight: (value: RightType1) => RightType2,
  ): Either<LeftType, RightType2>;
  <RightType1, RightType2>(
    onRight: (value: RightType1) => RightType2,
  ): <LeftType>(either: Either<LeftType, RightType1>) => Either<LeftType, RightType2>;
} = dual(2, function <
  LeftType,
  RightType1,
  RightType2,
>(either: Either<LeftType, RightType1>, onRight: (value: RightType1) => RightType2): Either<LeftType, RightType2> {
  return either._tag === "left" ? either : right(onRight(either.right));
});

export const biMap: {
  <LeftType1, RightType1, LeftType2, RightType2>(
    either: Either<LeftType1, RightType1>,
    func: {
      onLeft: (value: LeftType1) => LeftType2;
      onRight: (value: RightType1) => RightType2;
    },
  ): Either<LeftType2, RightType2>;
  <LeftType1, RightType1, LeftType2, RightType2>(func: {
    onLeft: (value: LeftType1) => LeftType2;
    onRight: (value: RightType1) => RightType2;
  }): (either: Either<LeftType1, RightType1>) => Either<LeftType2, RightType2>;
} = dual(
  2,
  function <LeftType1, RightType1, LeftType2, RightType2>(
    either: Either<LeftType1, RightType1>,
    func: {
      onLeft: (value: LeftType1) => LeftType2;
      onRight: (value: RightType1) => RightType2;
    },
  ): Either<LeftType2, RightType2> {
    return either._tag === "left" ? left(func.onLeft(either.left)) : right(func.onRight(either.right));
  },
);

export const flatMapLeft: {
  <LeftType1, RightType, LeftType2>(
    either: Either<LeftType1, RightType>,
    onLeft: (value: LeftType1) => Either<LeftType2, RightType>,
  ): Either<LeftType2, RightType>;
  <LeftType1, RightType, LeftType2>(
    onLeft: (value: LeftType1) => Either<LeftType2, RightType>,
  ): (either: Either<LeftType1, RightType>) => Either<LeftType2, RightType>;
} = dual(2, function <
  LeftType1,
  RightType,
  LeftType2,
>(either: Either<LeftType1, RightType>, onLeft: (value: LeftType1) => Either<LeftType2, RightType>): Either<
  LeftType2,
  RightType
> {
  return either._tag === "left" ? onLeft(either.left) : either;
});

export const flatMapRight: {
  <LeftType, RightType1, RightType2>(
    either: Either<LeftType, RightType1>,
    onRight: (value: RightType1) => Either<LeftType, RightType2>,
  ): Either<LeftType, RightType2>;
  <LeftType, RightType1, RightType2>(
    onRight: (value: RightType1) => Either<LeftType, RightType2>,
  ): (either: Either<LeftType, RightType1>) => Either<LeftType, RightType2>;
} = dual(2, function <
  LeftType,
  RightType1,
  RightType2,
>(either: Either<LeftType, RightType1>, onRight: (value: RightType1) => Either<LeftType, RightType2>): Either<
  LeftType,
  RightType2
> {
  return either._tag === "left" ? either : onRight(either.right);
});

export const biFlatMap: {
  <LeftType1, RightType1, LeftType2, RightType2>(
    either: Either<LeftType1, RightType1>,
    func: {
      onLeft: (value: LeftType1) => Either<LeftType2, RightType2>;
      onRight: (value: RightType1) => Either<LeftType2, RightType2>;
    },
  ): Either<LeftType2, RightType2>;
  <LeftType1, RightType1, LeftType2, RightType2>(func: {
    onLeft: (value: LeftType1) => Either<LeftType2, RightType2>;
    onRight: (value: RightType1) => Either<LeftType2, RightType2>;
  }): (either: Either<LeftType1, RightType1>) => Either<LeftType2, RightType2>;
} = dual(
  2,
  function <LeftType1, RightType1, LeftType2, RightType2>(
    either: Either<LeftType1, RightType1>,
    func: {
      onLeft: (value: LeftType1) => Either<LeftType2, RightType2>;
      onRight: (value: RightType1) => Either<LeftType2, RightType2>;
    },
  ): Either<LeftType2, RightType2> {
    return either._tag === "left" ? func.onLeft(either.left) : func.onRight(either.right);
  },
);
