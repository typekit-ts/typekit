import { describe, expect, test } from "bun:test";

import { Option } from ".";

describe("option", () => {
  test("some()", () => {
    const someValue = Option.some(1);

    expect(someValue._tag).toBe("some");
  });

  test("none()", () => {
    const noneValue = Option.none<number>();

    expect(noneValue._tag).toBe("none");
  });

  test("isSome()", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    expect(Option.isSome(someValue)).toBe(true);
    expect(Option.isSome(noneValue)).toBe(false);
  });

  test("isNone()", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    expect(Option.isNone(someValue)).toBe(false);
    expect(Option.isNone(noneValue)).toBe(true);
  });

  test("ap() - data first", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const apFn = (option: Option.Option<number>) =>
      option._tag === "some" ? Option.some(option.value + 1) : Option.none<number>();

    const appliedSome = Option.ap(someValue, apFn);
    const appliedNone = Option.ap(noneValue, apFn);

    expect(appliedSome._tag).toBe("some");
    if (appliedSome._tag === "some") {
      expect(appliedSome.value).toBe(2);
    }

    expect(appliedNone._tag).toBe("none");
  });

  test("ap() - data last", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const apFn = Option.ap((option: Option.Option<number>) =>
      option._tag === "some" ? Option.some(option.value + 1) : Option.none<number>(),
    );

    const appliedSome = apFn(someValue);
    const appliedNone = apFn(noneValue);

    expect(appliedSome._tag).toBe("some");
    if (appliedSome._tag === "some") {
      expect(appliedSome.value).toBe(2);
    }

    expect(appliedNone._tag).toBe("none");
  });

  test("map() - data first", () => {
    const add1 = (value: number) => value + 1;
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const mappedSome = Option.map(someValue, add1);
    const mappedNone = Option.map(noneValue, add1);

    expect(mappedSome._tag).toBe("some");
    if (mappedSome._tag === "some") {
      expect(mappedSome.value).toBe(2);
    }
    expect(mappedNone).toBe(noneValue);
  });

  test("map() - data last", () => {
    const add1 = (value: number) => value + 1;
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const mappedSome = Option.map(add1)(someValue);
    const mappedNone = Option.map(add1)(noneValue);

    expect(mappedSome._tag).toBe("some");
    if (mappedSome._tag === "some") {
      expect(mappedSome.value).toBe(2);
    }
    expect(mappedNone).toBe(noneValue);
  });

  test("flatMap() - data first", () => {
    const someValue = Option.some(2);
    const noneValue = Option.none<number>();

    const flatMapFn = (value: number) => Option.some(value * 2);

    const mappedSome = Option.flatMap(someValue, flatMapFn);
    const mappedNone = Option.flatMap(noneValue, flatMapFn);

    expect(mappedSome._tag).toBe("some");
    if (mappedSome._tag === "some") {
      expect(mappedSome.value).toBe(4);
    }
    expect(mappedNone).toBe(noneValue);
  });

  test("flatMap() - data last", () => {
    const someValue = Option.some(2);
    const noneValue = Option.none<number>();

    const flatMapFn = Option.flatMap((value: number) => Option.some(value * 2));

    const mappedSome = flatMapFn(someValue);
    const mappedNone = flatMapFn(noneValue);

    expect(mappedSome._tag).toBe("some");
    if (mappedSome._tag === "some") {
      expect(mappedSome.value).toBe(4);
    }
    expect(mappedNone).toBe(noneValue);
  });

  test("flatten()", () => {
    const nestedSomeValue = Option.some(Option.some(1));
    const nestedNoneValue = Option.some(Option.none());
    const noneValue = Option.none<Option.Option<Option.Option<number>>>();

    const flattenedNestedSome = Option.flatten(nestedSomeValue);
    const flattenedNestedNone = Option.flatten(nestedNoneValue);
    const flattenedNoneValue = Option.flatten(noneValue);

    expect(flattenedNestedSome._tag).toBe("some");
    if (Option.isSome(flattenedNestedSome)) {
      expect(flattenedNestedSome.value).toBe(1);
    }

    expect(flattenedNestedNone._tag).toBe("none");

    expect(flattenedNoneValue._tag).toBe("none");
  });

  test("match() - data first", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const matchFn = {
      isSome: (value: number) => value,
      isNone: () => 2,
    };

    const matchedSome = Option.match(someValue, matchFn);
    const matchedNone = Option.match(noneValue, matchFn);

    expect(matchedSome).toBe(1);
    expect(matchedNone).toBe(2);
  });

  test("match() - data last", () => {
    const someValue = Option.some(1);
    const noneValue = Option.none<number>();

    const matchFn = {
      isSome: (value: number) => value,
      isNone: () => 2,
    };

    const matchedSome = Option.match(matchFn)(someValue);
    const matchedNone = Option.match(matchFn)(noneValue);

    expect(matchedSome).toBe(1);
    expect(matchedNone).toBe(2);
  });

  test("pipe()", () => {
    const someValue = Option.some(1).pipe(
      Option.map((value) => value + 2),
      Option.flatMap((value) => Option.some(value * 2)),
      Option.map((value) => value + 1),
    );
    const noneValue = Option.none<number>().pipe(
      Option.map((value) => value + 2),
      Option.flatMap((value) => Option.some(value * 2)),
      Option.map((value) => value + 1),
    );

    expect(someValue._tag).toBe("some");
    if (Option.isSome(someValue)) {
      expect(someValue.value).toBe(7);
    }

    expect(noneValue._tag).toBe("none");
  });
});
