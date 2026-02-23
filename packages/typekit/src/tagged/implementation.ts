import { dual } from "~/dual";

export interface Tagged<Tag extends string> {
  readonly _tag: Tag;
}

export const tagged: {
  <Tag extends string, T extends object>(object: T, tag: Tag): T & Tagged<Tag>;
  <Tag extends string>(tag: Tag): <T extends object>(object: T) => T & Tagged<Tag>;
} = dual(2, function <Tag extends string, T extends object>(object: T & { _tag?: never }, tag: Tag): T & Tagged<Tag> {
  return Object.defineProperty(object, "_tag", {
    value: tag,
    writable: false,
    enumerable: true,
    configurable: false,
  }) as T & Tagged<Tag>;
});
