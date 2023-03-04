declare class Signal<T = any> {
  /** @internal */
  _value: unknown;

  /** @internal */
  _oldValue: unknown;

  /**
   * @internal
   */
  _version: number;

  /** @internal */
  _node?: Node;

  /** @internal */
  _property: string;

  /** @internal */
  _listeners: Set<(...args: unknown[]) => void>;

  constructor(node?: Node | undefined, value?: T, property?: string);
  constructor(value?: T, node?: Node | undefined, property?: string);

  /** @internal */
  _refresh(): boolean;

  subscribe(fn: (value: T) => void): () => void;

  unsubscribe(fn: (value: T) => void): void;

  attachTo(node: Node, property?: string): void;

  copyTo(node: Node, property?: string, keepInSync?: boolean): Signal<T>;

  detachFrom(node: Node): void;

  toString(): string;

  get value(): T;
  set value(value: T);
}

function Signal(this: Signal, node: Node | undefined = undefined, value: unknown = undefined, property: string = "innerHTML") {
  if (!(this instanceof Signal)) {
    return new Signal(node, value, property);
  }

  if (typeof node !== "object") {
    // We can assume that the first argument is the value
    value = node;
    node = undefined;
  }

  this._value = value;
  this._oldValue = undefined;
  this._version = 0;
  this._node = node;
  this._property = property;
  this._listeners = new Set();

  if (node && value) {
    node[property] = value;
  } else if (node && !value) {
    this._value = node[property];
  }
  // else if (!node && !value) {
  //   throw new Error("Signal must be initialized with a value or a node");
  // }
}

Signal.prototype = {
  _value: undefined,
  _oldValue: undefined,
  _version: 0,
  _node: undefined,
  _property: "innerHTML",
  _listeners: new Set(),

  _refresh() {
    if (this._node) {
      this._node[this._property] = this._value;
      return true;
    }
    return false;
  },

  subscribe(fn: (value: unknown) => void) {
    this._listeners.add(fn);
    return () => this.unsubscribe(fn);
  },

  unsubscribe(fn: (value: unknown) => void) {
    this._listeners.delete(fn);
  },

  attachTo(node: Node, property: string) {
    property = property || this._property;
    this._node = node;
    node[property] = this._value;
  },

  copyTo(node: Node, property: string, keepInSync: boolean = false) {
    property = property || this._property;
    const signal = new Signal(node, this._value, property);
    // To prevent circular updates, we only subscribe to the signal if keepInSync is true and don't subscribe back.
    if (keepInSync) this.subscribe(value => (signal.value = value));
    return signal;
  },

  detachFrom(node: Node) {
    if (this._node === node) {
      this._node = undefined;
    }
  },

  toString() {
    return String(this._value);
  },

  get value() {
    return this._value;
  },

  set value(value: unknown) {
    this._oldValue = this._value;
    this._value = value;
    this._version += 1;
    this._listeners.forEach(fn => fn(value, this._oldValue));
    this._refresh();
  },
};

export default Signal;
