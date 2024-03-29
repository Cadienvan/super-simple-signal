export type SignalOptions = {
  property: string;
  bind: boolean;
  bindEvents: string[];
  render: (value: unknown) => string;
  allowDirty?: boolean;
};

export const defaultOptions = {
  property: "innerHTML",
  bind: false,
  bindEvents: [],
  render: (value: any) => (value.hasOwnProperty("toString") ? value.toString() : JSON.stringify(value)) || "",
  allowDirty: false,
};

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
  _opts: SignalOptions;

  /** @internal */
  _queuedForRerender: Boolean;

  /** @internal */
  _listeners: Set<(...args: unknown[]) => void>;

  constructor(node?: Node | undefined, value?: T, opts?: SignalOptions);
  constructor(value?: T, node?: Node | undefined, opts?: SignalOptions);

  /** @internal */
  _refresh(): boolean;

  /** @internal */
  _setRaw(value: T): void;

  /** @internal */
  _attachNodeEvents(): void;

  subscribe(fn: (value: T) => void): () => void;

  unsubscribe(fn: (value: T) => void): void;

  attachTo(node: Node, property?: string): void;

  copyTo(node: Node, opts?: SignalOptions, keepInSync?: boolean): Signal<T>;

  detach(): void;

  toString(): string;

  get value(): T;
  set value(value: T);
}

function Signal(this: Signal, node: Node | undefined = undefined, value: unknown = undefined, opts: SignalOptions = defaultOptions) {
  opts = { ...defaultOptions, ...opts };
  if (!(this instanceof Signal)) {
    return new Signal(node, value, opts);
  }

  if (!(node instanceof Node)) {
    // We can assume that the first argument is the value
    value = node;
    node = undefined;
  }

  this._value = value;
  this._oldValue = undefined;
  this._version = 0;
  this._node = node;
  this._opts = opts;
  this._queuedForRerender = false;
  this._listeners = new Set();

  if (node && value) {
    node[opts.property] = value;
  } else if (node && !value) {
    this._value = node[opts.property];
  }

  if (node && opts.bind) {
    this._attachNodeEvents();
  } else if (node && !opts.bind) {
    this._refresh();
  }
  return this;
}

Signal.prototype = {
  _value: undefined,
  _oldValue: undefined,
  _version: 0,
  _node: undefined,
  _opts: defaultOptions,
  _queuedForRerender: false,
  _listeners: new Set(),

  _refresh() {
    if (this._node) {
      this._node[this._opts.property] = this._opts.render(this._value);
      return true;
    }
    return false;
  },

  _setRaw(value: unknown) {
    this._oldValue = this._value;
    this._value = value;
    this._version += 1;
    this._listeners.forEach(listener => listener(value, this._oldValue));
  },

  _attachNodeEvents() {
    this._node?.addEventListener("destroy", () => (this._node = undefined));
    this._node?.addEventListener("remove", () => (this._node = undefined));
    for (const event of this._opts.bindEvents) {
      this._node?.addEventListener(event, () => {
        this._setRaw(this._node?.[this._opts.property]);
      });
    }
  },

  subscribe(fn: (value: unknown) => void) {
    this._listeners.add(fn);
    return () => this.unsubscribe(fn);
  },

  unsubscribe(fn: (value: unknown) => void) {
    this._listeners.delete(fn);
  },

  attachTo(node: Node, property: string) {
    property = property || this._opts.property;
    this._node = node;
    node[property] = this._value;
  },

  copyTo(node: Node, opts: SignalOptions, keepInSync: boolean = true) {
    const signal = new Signal(node, this._value, opts);
    if (keepInSync) this.subscribe(value => (signal.value = value));
    return signal;
  },

  detach() {
    this._node = undefined;
  },

  toString() {
    return String(this._value);
  },

  get value() {
    return this._value;
  },

  set value(value: unknown) {
    if (this._value === value && !this._opts.allowDirty) return;
    this._oldValue = this._value;
    this._value = value;
    this._version += 1;
    this._listeners.forEach(fn => fn(value, this._oldValue));
    if (!this._queuedForRerender) {
      this._queuedForRerender = true;
      window.queueMicrotask(() => {
        this._queuedForRerender = false;
        this._refresh();
      });
    }
  },
};

export default Signal;
