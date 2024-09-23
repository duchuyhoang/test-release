declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNonEmptyArray(this: Matchers<void, HTMLElement>): R;
    }
  }
  type Maybe<T> = T | null;
}

export {};
