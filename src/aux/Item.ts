export default class Item<T> {
  public val: T;
  public prev: Item<T>;
  public next: Item<T>;

  constructor(val: T) {
    this.val = val;
    this.prev = undefined;
    this.next = undefined;
  }

  public print(transform: (i: T) => any = (i) => i) {
    return transform(this.val);
  }
}

export interface IIterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}
