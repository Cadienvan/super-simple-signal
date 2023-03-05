import Signal, { SignalOptions } from "./Signal";

// Computed is a signal that is derived from other signals and is updated when any of its dependencies change.
declare class Computed<T = any> extends Signal<T> {
  /** @internal */
  _dependencies: Array<Signal>;

  /** @internal */
  _fn: (...args: any[]) => T;

  constructor(dependencies: Signal[], fn: () => T, node?: Node, opts?: SignalOptions);

  /** @internal */
  _set(): void;
}

function Computed(
  this: Computed,
  dependencies: Signal | Signal[],
  fn: (...args: any[]) => any,
  node: Node | undefined = undefined,
  opts: SignalOptions = {
    property: "innerHTML",
    bind: false,
    bindEvents: [],
  }
) {
  dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
  if (!(this instanceof Computed)) {
    return new Computed(dependencies, fn, node, opts);
  }

  // Call Signal constructor
  Signal.call(this, node, undefined, opts);

  this._dependencies = dependencies;
  this._fn = fn;

  for (const dependency of dependencies) {
    dependency.subscribe(this._set.bind(this));
  }

  this._set();
}

Computed.prototype = Object.create(Signal.prototype);
Computed.prototype.constructor = Computed;

Computed.prototype._set = function () {
  this._oldValue = this._value;
  this._value = this._fn(this._dependencies.length > 1 ? this._dependencies.map(dependency => dependency.value) : this._dependencies[0].value, this._dependencies.length > 1 ? this._dependencies.map(dependency => dependency._oldValue) : this._dependencies[0]._oldValue, this._oldValue);
  this._version++;
  this._listeners.forEach(listener => listener(this._value, this._oldValue));
  this._refresh();
};

Object.defineProperty(Computed.prototype, "value", {
  set: function (value) {
    throw new Error("Computed signals cannot be set");
  },
  get: function () {
    return this._value;
  },
});
export default Computed;
