import { describe, expect, test } from "bun:test";

import { Either } from ".";

describe("either", () => {
  test("left()", () => {
    const value = Either.left(1);

    expect(value._tag).toBe("left");
  });

  test("right()", () => {
    const value = Either.right("value");

    expect(value._tag).toBe("right");
  });

  test("isLeft()", () => {
    const leftValue = Either.left(1);
    const value1 = Either.isLeft(leftValue);

    expect(value1).toBe(true);

    const rightValue = Either.right("value");
    const value2 = Either.isLeft(rightValue);

    expect(value2).toBe(false);
  });

  test("isRight()", () => {
    const leftValue = Either.left(1);
    const value1 = Either.isRight(leftValue);

    expect(value1).toBe(false);

    const rightValue = Either.right("value");
    const value2 = Either.isRight(rightValue);

    expect(value2).toBe(true);
  });

  test("unwrapLeft()", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const value = Either.unwrapLeft(leftValue);

    expect(value).toBe(1);

    expect(() => Either.unwrapLeft(rightValue)).toThrow();
  });

  test("unwrapLeftOr()", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const value1 = Either.unwrapLeftOr(leftValue, 2);
    const value2 = Either.unwrapLeftOr(rightValue, 2);

    expect(value1).toBe(1);
    expect(value2).toBe(2);
  });

  test("unwrapRight()", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const value = Either.unwrapRight(rightValue);

    expect(value).toBe("value");

    expect(() => Either.unwrapRight(leftValue)).toThrow();
  });

  test("unwrapRightOr()", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const value1 = Either.unwrapRightOr(leftValue, "default");
    const value2 = Either.unwrapRightOr(rightValue, "default");

    expect(value1).toBe("default");
    expect(value2).toBe("value");
  });

  test("flatten()", () => {
    const leftValue = Either.left<number, Either.Either<number, string>>(1);
    const rightWithRight = Either.right<number, Either.Either<number, string>>(Either.right("value"));
    const rightWithLeft = Either.right<number, Either.Either<number, string>>(Either.left(1));

    const flattenedLeft = Either.flatten(leftValue);
    const flattenedRightWithRight = Either.flatten(rightWithRight);
    const flattenedRightWithLeft = Either.flatten(rightWithLeft);

    expect(flattenedLeft._tag).toBe("left");
    if (Either.isLeft(flattenedLeft)) {
      expect(flattenedLeft.left).toBe(1);
    }

    expect(flattenedRightWithRight._tag).toBe("right");
    if (Either.isRight(flattenedRightWithRight)) {
      expect(flattenedRightWithRight.right).toBe("value");
    }

    expect(flattenedRightWithLeft._tag).toBe("left");
    if (Either.isLeft(flattenedRightWithLeft)) {
      expect(flattenedRightWithLeft.left).toBe(1);
    }
  });

  test("flatten2()", () => {
    const nestedLeftValue = Either.left<Either.Either<number, string>, Either.Either<number, string>>(Either.left(1));
    const nestedRightValue = Either.left<Either.Either<number, string>, Either.Either<number, string>>(
      Either.right("value"),
    );
    const rightValue = Either.right<Either.Either<number, string>, Either.Either<number, string>>(
      Either.right("value"),
    );

    const flattenedNestedLeft = Either.flatten2(nestedLeftValue);
    const flattenedNestedRight = Either.flatten2(nestedRightValue);
    const flattenedRight = Either.flatten2(rightValue);

    expect(flattenedNestedLeft._tag).toBe("left");
    if (Either.isLeft(flattenedNestedLeft)) {
      expect(flattenedNestedLeft.left).toBe(1);
    }

    expect(flattenedNestedRight._tag).toBe("right");
    if (Either.isRight(flattenedNestedRight)) {
      expect(flattenedNestedRight.right).toBe("value");
    }

    expect(flattenedRight._tag).toBe("right");
    if (Either.isRight(flattenedRight)) {
      expect(flattenedRight.right).toBe("value");
    }
  });

  test("mapLeft() - data first", () => {
    const add1 = (value: number) => value + 1;
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const mappedLeft = Either.mapLeft(leftValue, add1);
    const mappedRight = Either.mapLeft(rightValue, add1);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(2);
    }
    expect(mappedRight).toBe(rightValue);
  });

  test("mapLeft() - data last", () => {
    const add1 = (value: number) => value + 1;
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const mappedLeft = Either.mapLeft(add1)(leftValue);
    const mappedRight = Either.mapLeft(add1)(rightValue);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(2);
    }
    expect(mappedRight).toBe(rightValue);
  });

  test("mapRight() - data first", () => {
    const addBang = (value: string) => `${value}!`;
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const mappedLeft = Either.mapRight(leftValue, addBang);
    const mappedRight = Either.mapRight(rightValue, addBang);

    expect(mappedLeft).toBe(leftValue);
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("mapRight() - data last", () => {
    const addBang = (value: string) => `${value}!`;
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const mappedLeft = Either.mapRight(addBang)(leftValue);
    const mappedRight = Either.mapRight(addBang)(rightValue);

    expect(mappedLeft).toBe(leftValue);
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("biMap() - data first", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const bimapFn = {
      onLeft: (value: number) => value + 1,
      onRight: (value: string) => `${value}!`,
    };

    const mappedLeft = Either.biMap(leftValue, bimapFn);
    const mappedRight = Either.biMap(rightValue, bimapFn);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(2);
    }
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("biMap() - data last", () => {
    const leftValue = Either.left(1);
    const rightValue = Either.right("value");

    const bimapFn = Either.biMap({
      onLeft: (value: number) => value + 1,
      onRight: (value: string) => `${value}!`,
    });

    const mappedLeft = bimapFn(leftValue);
    const mappedRight = bimapFn(rightValue);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(2);
    }
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("flatMapLeft() - data first", () => {
    const leftValue: Either.Either<number, string> = Either.left(2);
    const rightValue: Either.Either<number, string> = Either.right("value");

    const flatMapFn = (value: number) => Either.left<number, string>(value * 2);

    const mappedLeft = Either.flatMapLeft(leftValue, flatMapFn);
    const mappedRight = Either.flatMapLeft(rightValue, flatMapFn);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(4);
    }
    expect(mappedRight).toBe(rightValue);
  });

  test("flatMapLeft() - data last", () => {
    const leftValue: Either.Either<number, string> = Either.left(2);
    const rightValue: Either.Either<number, string> = Either.right("value");

    const flatMapFn = Either.flatMapLeft((value: number) => Either.left<number, string>(value * 2));

    const mappedLeft = flatMapFn(leftValue);
    const mappedRight = flatMapFn(rightValue);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(4);
    }
    expect(mappedRight).toBe(rightValue);
  });

  test("flatMapRight() - data first", () => {
    const leftValue: Either.Either<number, string> = Either.left(2);
    const rightValue: Either.Either<number, string> = Either.right("value");

    const flatMapFn = (value: string) => Either.right<number, string>(`${value}!`);

    const mappedLeft = Either.flatMapRight(leftValue, flatMapFn);
    const mappedRight = Either.flatMapRight(rightValue, flatMapFn);

    expect(mappedLeft).toBe(leftValue);
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("flatMapRight() - data last", () => {
    const leftValue: Either.Either<number, string> = Either.left(2);
    const rightValue: Either.Either<number, string> = Either.right("value");

    const flatMapFn = Either.flatMapRight((value: string) => Either.right<number, string>(`${value}!`));

    const mappedLeft = flatMapFn(leftValue);
    const mappedRight = flatMapFn(rightValue);

    expect(mappedLeft).toBe(leftValue);
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("biFlatMap() - data first", () => {
    const leftValue = Either.left(2);
    const rightValue = Either.right("value");

    const biFlatMapFn = {
      onLeft: (value: number) => Either.left<number, string>(value * 2),
      onRight: (value: string) => Either.right<number, string>(`${value}!`),
    };

    const mappedLeft = Either.biFlatMap(leftValue, biFlatMapFn);
    const mappedRight = Either.biFlatMap(rightValue, biFlatMapFn);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(4);
    }
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });

  test("biFlatMap() - data last", () => {
    const leftValue = Either.left(2);
    const rightValue = Either.right("value");

    const biFlatMapFn = Either.biFlatMap({
      onLeft: (value: number) => Either.left<number, string>(value * 2),
      onRight: (value: string) => Either.right<number, string>(`${value}!`),
    });

    const mappedLeft = biFlatMapFn(leftValue);
    const mappedRight = biFlatMapFn(rightValue);

    expect(mappedLeft._tag).toBe("left");
    if (Either.isLeft(mappedLeft)) {
      expect(mappedLeft.left).toBe(4);
    }
    expect(mappedRight._tag).toBe("right");
    if (Either.isRight(mappedRight)) {
      expect(mappedRight.right).toBe("value!");
    }
  });
});
