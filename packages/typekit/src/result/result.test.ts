import { describe, expect, test } from "bun:test";

import { isErr, isOk, Result } from ".";

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

  test("map()", () => {
    const add1 = (value: number) => value + 1;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.map(add1)(okValue);
    const mappedErr = Result.map(add1)(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr).toBe(errValue);
  });

  test("mapErr()", () => {
    const addBang = (value: string) => `${value}!`;
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const mappedOk = Result.mapErr(addBang)(okValue);
    const mappedErr = Result.mapErr(addBang)(errValue);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("bimap()", () => {
    const okValue = Result.ok(1);
    const errValue = Result.err("error");

    const bimapFn = Result.bimap({
      onOk: (value: number) => value + 1,
      onErr: (error: string) => `${error}!`,
    });

    const mappedOk = bimapFn(okValue);
    const mappedErr = bimapFn(errValue);

    expect(mappedOk._tag).toBe("ok");
    if (isOk(mappedOk)) {
      expect(mappedOk.value).toBe(2);
    }
    expect(mappedErr._tag).toBe("err");
    if (isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("flatMap()", () => {
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

  test("flatMapError()", () => {
    const okValue: Result.Result<number, string> = Result.ok(2);
    const errValue: Result.Result<number, string> = Result.err("error");

    const flatMapErrFn = Result.flatMapError((error: string) => Result.err<number, string>(`${error}!`));

    const mappedOk = flatMapErrFn(okValue);
    const mappedErr = flatMapErrFn(errValue);

    expect(mappedOk).toBe(okValue);
    expect(mappedErr._tag).toBe("err");
    if (Result.isErr(mappedErr)) {
      expect(mappedErr.error).toBe("error!");
    }
  });

  test("biFlatMap()", () => {
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
