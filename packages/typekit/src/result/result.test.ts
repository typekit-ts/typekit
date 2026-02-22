import { describe, expect, test } from "bun:test";

import { Result } from ".";

describe("result", () => {
  test("ok()", () => {
    const value = Result.ok(1);

    expect(value._tag).toBe("ok");
  });

  test("none()", () => {
    const value = Result.err("error");

    expect(value._tag).toBe("err");
  });

  test("isOk()", () => {
    const okValue = Result.ok(1);
    const value1 = Result.isOk(okValue);

    expect(value1).toBe(true);

    const errValue = Result.err("error");
    const value2 = Result.isOk(errValue);

    expect(value2).toBe(false);
  });

  test("isErr()", () => {
    const okValue = Result.ok(1);
    const value1 = Result.isErr(okValue);

    expect(value1).toBe(false);

    const errValue = Result.err("error");
    const value2 = Result.isErr(errValue);

    expect(value2).toBe(true);
  });

  test("unwrap()", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const value = Result.unwrap(okValue);

    expect(value).toBe(1);

    expect(() => Result.unwrap(errValue)).toThrow();
  });

  test("unwrapOr()", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const value1 = Result.unwrapOr(okValue, 2);
    const value2 = Result.unwrapOr(errValue, 2);

    expect(value1).toBe(1);
    expect(value2).toBe(2);
  });

  test("unwrapErr()", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const error = Result.unwrapErr(errValue);

    expect(error).toBe("error");

    expect(() => Result.unwrapErr(okValue)).toThrow();
  });

  test("unwrapErrOr()", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const value1 = Result.unwrapErrOr(okValue, "not error");
    const value2 = Result.unwrapErrOr(errValue, "not error");

    expect(value1).toBe("not error");
    expect(value2).toBe("error");
  });

  test("flatten()", () => {
    const nestedOkValue = Result.ok<Result.Result<number, string>, string>(Result.ok<number, string>(1));
    const nestedErrValue = Result.ok<Result.Result<number, string>, string>(Result.err("error"));
    const errValue = Result.err<Result.Result<number, string>, string>("error");

    const flattedNestedOk = Result.flatten(nestedOkValue);
    const flattedNestedErr = Result.flatten(nestedErrValue);
    const flattenedErr = Result.flatten(errValue);

    expect(flattedNestedOk._tag).toBe("ok");
    if (Result.isOk(flattedNestedOk)) {
      expect(flattedNestedOk.value).toBe(1);
    }

    expect(flattedNestedErr._tag).toBe("err");
    if (Result.isErr(flattedNestedErr)) {
      expect(flattedNestedErr.error).toBe("error");
    }

    expect(flattenedErr._tag).toBe("err");
    if (Result.isErr(flattenedErr)) {
      expect(flattenedErr.error).toBe("error");
    }
  });

  test("map() - data first", () => {
    const add1 = (value: number) => value + 1;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.map(okValue, add1);
    const mappedErr = Result.map(errValue, add1);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr).toBe(errValue);
  });

  test("map() - data last", () => {
    const add1 = (value: number) => value + 1;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.map(add1)(okValue);
    const mappedErr = Result.map(add1)(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr).toBe(errValue);
  });

  test("mapErr() - data first", () => {
    const addBang = (value: string) => `${value}!`;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.mapErr(okValue, addBang);
    const mappedErr = Result.mapErr(errValue, addBang);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("mapErr() - data last", () => {
    const addBang = (value: string) => `${value}!`;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.mapErr(addBang)(okValue);
    const mappedErr = Result.mapErr(addBang)(errValue);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("biMap() - data first", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const bimapFn = {
      onOk: (value: number) => value + 1,
      onErr: (error: string) => `${error}!`,
    };

    const mappedOk = Result.biMap(okValue, bimapFn);
    const mappedErr = Result.biMap(errValue, bimapFn);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("biMap() - data last", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const bimapFn = Result.biMap({
      onOk: (value: number) => value + 1,
      onErr: (error: string) => `${error}!`,
    });

    const mappedOk = bimapFn(okValue);
    const mappedErr = bimapFn(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("flatMap() - data first", () => {
    const okValue: Result.Result<number, string> = Result.ok(2);
    const errValue: Result.Result<number, string> = Result.err("error");

    const flatMapFn = (value: number) => Result.ok<number, string>(value * 2);

    const mappedOk = Result.flatMap(okValue, flatMapFn);
    const mappedErr = Result.flatMap(errValue, flatMapFn);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(4);
    }
    expect(mappedErr).toBe(errValue);
  });

  test("flatMap() - data last", () => {
    const okValue: Result.Result<number, string> = Result.ok(2);
    const errValue: Result.Result<number, string> = Result.err("error");

    const flatMapFn = Result.flatMap((value: number) => Result.ok<number, string>(value * 2));

    const mappedOk = flatMapFn(okValue);
    const mappedErr = flatMapFn(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(4);
    }
    expect(mappedErr).toBe(errValue);
  });

  test("flatMapErr() - data first", () => {
    const okValue: Result.Result<number, string> = Result.ok(2);
    const errValue: Result.Result<number, string> = Result.err("error");

    const flatMapErrFn = (error: string) => Result.err<number, string>(`${error}!`);

    const mappedOk = Result.flatMapErr(okValue, flatMapErrFn);
    const mappedErr = Result.flatMapErr(errValue, flatMapErrFn);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("flatMapErr() - data last", () => {
    const okValue: Result.Result<number, string> = Result.ok(2);
    const errValue: Result.Result<number, string> = Result.err("error");

    const flatMapErrFn = Result.flatMapErr((error: string) => Result.err<number, string>(`${error}!`));

    const mappedOk = flatMapErrFn(okValue);
    const mappedErr = flatMapErrFn(errValue);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("biFlatMap() - data first", () => {
    const okValue = Result.ok(2);
    const errValue = Result.err("error");

    const biFlatMapFn = {
      onOk: (value: number) => Result.ok(value * 2),
      onErr: (error: string) => Result.err(`${error}!`),
    };

    const mappedOk = Result.biFlatMap(okValue, biFlatMapFn);
    const mappedErr = Result.biFlatMap(errValue, biFlatMapFn);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(4);
    }
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("biFlatMap() - data last", () => {
    const okValue = Result.ok(2);
    const errValue = Result.err("error");

    const biFlatMapFn = Result.biFlatMap({
      onOk: (value: number) => Result.ok(value * 2),
      onErr: (error: string) => Result.err(`${error}!`),
    });

    const mappedOk = biFlatMapFn(okValue);
    const mappedErr = biFlatMapFn(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (Result.isOk(mappedOk)) {
      expect(mappedOk.value).toBe(4);
    }
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });
});
