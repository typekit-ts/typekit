import { describe, expect, test } from "bun:test";

import { Pipe } from ".";

describe("pipe", () => {
  test("1 argument", () => {
    const value = Pipe.pipe(1);

    expect(value).toBe(1);
  });

  test("multiple arguments", () => {
    const add = (a: number) => (b: number) => a + b;

    const value = Pipe.pipe(1, add(1));

    expect(value).toBe(2);
  });
});

describe("Pipeable", () => {
  test("basic pipeable object", () => {
    interface PipeableObject extends Pipe.Pipeable {
      value: number;
    }

    const createObject = (value: number): PipeableObject => {
      return Pipe.pipeable({ value });
    };

    const add = (object: PipeableObject) => createObject(object.value + 1);

    const object = createObject(1);

    const value = object.pipe(add);

    expect(value.value).toBe(2);
  });
});
