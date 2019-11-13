import Item from "./Item";

export class LinkedList<T> {
  private size: number;
  private head: Item<T>;
  private tail: Item<T>;
  private compare: (one: T, other: T) => boolean = (one: T, other: T) => one === other;

  constructor(compareFunction?: (one: T, other: T) => boolean) {
    this.size = 0;
    this.head = this.tail = undefined;
    if (compareFunction) {
      this.compare = compareFunction;
    }
  }
  public push(val: T): void {
    const node = new Item(val);
    if (this.size === 0) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.size++;
  }
  public pop(): T {
    this.size--;
    const ret: Item<T> = this.tail;
    if (this.size > 0) {
      this.tail = this.tail.prev;
      this.tail.next = undefined;
    } else {
      this.headAndTailResetToNull();
    }
    return ret.val;
  }

  public shift(): T {
    this.size--;
    const ret: Item<T> = this.head;
    if (this.size > 0) {
      this.head = this.head.next;
      this.head.prev = undefined;
    } else {
      this.headAndTailResetToNull();
    }
    return ret.val;
  }

  public unshift(val: T): void {
    const node = new Item(val);
    if (this.size === 0) {
      this.head = this.tail = node;
    } else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
    this.size++;
  }

  public count(): number {
    return this.size;
  }

  public isEmpty(): boolean {
    return (this.count() === 0);
  }

  public delete(val: T): void {
    if (this.size === 0) {
      return;
    }
    let tempNode = this.head;
    while (!this.compare(tempNode.val, val)) {
      tempNode = tempNode.next;
      if (tempNode === undefined) {
        return;
      }
    }
    if (this.size === 1) {
      this.headAndTailResetToNull();
    } else if (tempNode === this.head) {
      this.shift();
    } else if (tempNode === this.tail) {
      this.pop();
    } else {
      if (tempNode.prev) {
        tempNode.prev.next = tempNode.next;
      }
      if (tempNode.next) {
        tempNode.next.prev = tempNode.prev;
      }
    }
    this.size--;
  }

  public headAndTailResetToNull(): void {
    this.head = this.tail = undefined;
  }

  public *items() {
    let node = this.head;
    while (node) {
      yield node;
      node = node.next;
    }
  }

  public getFirst() {
    return this.head.val;
  }

  public getLast() {
    return this.tail.val;
  }

  public print(transform: (i: T) => any) {
    let str = "";
    for (const item of this.items()) {
      str += " <- " + item.print(transform);
    }
    return str;
  }

  public addAfter(item: Item<T>, newValue: T) {
    const newItem = new Item<T>(newValue);
    newItem.next = item.next;
    newItem.prev = item;
    item.next = newItem;
    this.size++;
  }

  public addBefore(item: Item<T>, newValue: T) {
    const newItem = new Item<T>(newValue);
    newItem.next = item;
    newItem.prev = item.prev;
    item.prev = newItem;
    this.size++;
  }
}
