import type { Pipeable } from "~/pipe";

export interface Some<T> extends Pipeable {
  _tag: "some";
  value: T;
}

export interface None extends Pipeable {
  _tag: "none";
}

export type Option<T> = Some<T> | None;

// TODO - Implementation
