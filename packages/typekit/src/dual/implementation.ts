import type { AnyFunction } from "~/types";

export function dual<DataFirst extends AnyFunction, DataLast extends AnyFunction>(
  arity: number,
  body: DataFirst,
): DataFirst & DataLast {
  switch (arity) {
    case 2: {
      return function (a: any, b: any) {
        if (arguments.length === 2) {
          return body(a, b);
        }

        return (b: any) => body(b, a);
      } as any;
    }
    case 3: {
      return function (a: any, b: any, c: any) {
        if (arguments.length === 3) {
          return body(a, b, c);
        }

        return (c: any) => body(c, a, b);
      } as any;
    }
    default: {
      return function (...args: any[]) {
        if (args.length >= arity) {
          return body(...args);
        }

        return (a: any) => body(a, ...args);
      } as any;
    }
  }
}
